+++
title = "Haskell Field Notes: 2021"

[taxonomies]
tags = ["haskell"]
+++

In the past year of _not_ updating this blog, even though I said I would, I've been quite busy
shaving yaks: in addition to the apocalypse, house work, and my day job, my wife and I have been
working on a little Jungian-oriented astrology app with an accompanying Haskell backend. 
This has meant a surprising amount of new terrain to traverse, and I'll try to jot down some 
of the highlights here: I've gone from
the depths of C memory tomfoolery, to the heights of actually reading some books and papers on category
theory, passing through the vast fields of Haskell type level programming. I'll try to cover a bit more breadth than depth in a couple of "stories" from the Haskell trenches.

<!-- more -->

# Story 1: Building a Haskell API

This past year, I've developed an open source [city name autocompletion service](https://geocode.city), and a GraphQL backend for a still-in-progress app. I've had to put a lot of my previous industry experience towards choosing the most
ergonomic libraries and approaches, and I'm both glad that Haskell has so many interesting proposals for building
robust, maintainable applications, and slightly traumatized at how _niche_ some of these things can get: this ain't your grandpa's Ruby on Rails!

## Building a Haskell API: the web framework

We're building a React Native app, and as such, we needed an API to furnish data to draw charts, and show
a calendar of events (almanac-style,) in addition to the usual account management stuff. The tricky part of
drawing charts and astrological events is that they're rather deep data: a given natal chart will have
planetary positions, each with speed and position information about a planet, house cusps, aspects with their respective orbs and information, and much more. I initially started working on a regular JSON API, using [`Servant`](https://docs.servant.dev/en/stable/), just like I did for our little city name autocompletion
service, [geocode.city](https://geocode.city) but the fact that each complex datum could be composed of further
complex data made me think: wouldn't it be nice to not sweat how detailed the API can be, if the client
has the option to only request what they need, and as much stuff together as they need? This in fact is the mission
statement of GraphQL, so I started looking for Haskell libraries.

After watching Alejandro Serrano's [excellent talk about GraphQL](https://www.youtube.com/watch?v=JbeqwfZ2dRc), I decided to give [mu](https://github.com/higherkindness/mu-haskell) a try: I quite liked how one can describe the 
schema in a `.graphql` file, and then generate types from that. I quickly ran into an [issue with arbitrary scalars](https://github.com/higherkindness/mu-haskell/issues/293), which Alejandro was _very_ quick to fix himself, but as my schema grew, and I had to introduce some enumerated types, the advanced type trickery at play in `mu` broke down
and my code would no longer compile (I haven't had a chance to put together an example repo and report an issue, will try to soon!) I believe one has the option to just write the types by hand, but the machinery already felt a bit too opaque between that and hooking into the underlying web server and effect system (more on that later.) Reluctantly, since I'm a huge fan of what `mu` brings to the table in theory, I moved to the more humble, but stable, [morpheus-graphql](https://morpheusgraphql.com/about/). My schema has worked fine there, despite a couple of
minor template haskell foibles I was able to fix at the schema definition site. 

As an example, here's an excerpt of a handler for a "moment horoscope" request:

```haskell
resolveMoment :: API.AppM sig m => API.MomentArgs -> ResolverQ () m API.Moment
resolveMoment API.MomentArgs{API.utcDate} = do
  parsedTime <- lift $ parseZonedTime utcDate
  moment' <- lift $ Domain.moment parsedTime
  pure $
    API.Moment
      (resolvePlanetPositions $ Domain.momentPlanetPositions moment')
      (resolveAspects (Domain.momentPlanetaryAspects moment', []))
```

With the schema:

```graphql
type Aspect {
  definition: AspectDefinition!
  phase: AspectPhase!
  orb: SplitDegrees!
  aspecting: AspectParticipant!
  aspected: AspectParticipant!
}

type PlanetPosition {
  planet: Planet!
  houseNumber: HouseNumber
  latitude: SplitDegrees!
  longitude: SplitDegrees!
  speed: SplitDegrees!
  declination: SplitDegrees!
}

type Moment {
  planetPositions: [PlanetPosition!]!
  aspects: [Aspect!]!
}
```

(both the schema and the resolver recursively rely on further functions and types, but a given query may not traverse the whole thing!)

Here's an example request and response:

```graphql
{
  moment(utcDate: {utcFormatted: "2021-06-26T00:00:00Z"}){
    planetPositions{
      planet
      longitude{
        unSplit
        degrees
        minutes
        seconds
      }
    }
  }
  
}

// returns

{
  "data": {
    "moment": {
      "planetPositions": [
        {
          "planet": "Sun",
          "longitude": {
            "unSplit": 94.6277690291843,
            "seconds": 40,
            "minutes": 37,
            "degrees": 4
          }
        },
        {
          "planet": "Moon",
          "longitude": {
            "unSplit": 291.47395189460417,
            "seconds": 26,
            "minutes": 28,
            "degrees": 21
          }
        }]
    }
  }
}
```


**Summary** Servant is great for REST-ful APIs; graphql support is still suffering some growing pains, but Morpheus
has proven to be reliable and stable so far!



## Building a Haskell API: an effects system.

I've used the tried and true [RIO](https://hackage.haskell.org/package/rio) [before](https://github.com/lfborjas/freenatalchart.xyz): I dig the very useful custom prelude it provides, even though these days I'm _partial_ (get it) to [`relude`](https://kowainik.github.io/projects/relude), and I believe the [ReaderT design pattern](https://www.fpcomplete.com/blog/2017/06/readert-design-pattern/) is sensible and plenty for web applications. But, I am a dummy, and I like to make things harder for myself with a weird, too-new, option at least once in a personal project (I take the extremely conservative route every day at work: I'm happy to create a nightmare for myself, but never for colleagues!) After watching Alexis King's [legendary Effects for Less talk](https://www.youtube.com/watch?v=0jI-AlWEwYI), and having been acquainted with Purescript's "effect row" approach to specify _which_ side effects a function may have (vs. the all-encompassing `IO`,) I decided to give an effects library a try. 

Polysemy was my first candidate, but the aforementioned talk and the [mea culpa blog post](https://reasonablypolymorphic.com/blog/mea-culpa/) scared me away from it. Alexis' own [`freer-simple`](https://hackage.haskell.org/package/freer-simple) is probably the next best thing in terms of ease of use, but [`fused-effects`](https://hackage.haskell.org/package/fused-effects) with its promise of speed and the very excellent foundation
in the (extremely approachable!) [Fused Effects paper](https://people.cs.kuleuven.be/~tom.schrijvers/Research/papers/mpc2015.pdf) convinced me to give it a try. There's definitely quite a bit of ceremony, but I like
the very explicit approach they take, both engineer-y and mathematically elegant. Ideally, we'll get [eff](https://github.com/hasura/eff) in the near future!

Or maybe we [don't need effects?](https://喵.世界/2021/09/14/redundant-constraints/)

Here's an example effect for some cryptography effects (helper functions omitted,) which lends itself
to different carrier implementations for development or testing:

```haskell
data Crypto (m :: Type -> Type) k where
  -- | Given a password, return a hashed version
  HashPasswordBCrypt :: Password -> Crypto m (PasswordHash BCrypt)
  -- | Given a map of custom claims, generate a signed JWS
  -- with an iat claim.
  SignJWT :: CustomClaims -> Crypto m JWS
  GetRandomPassword :: Crypto m Text

hashPasswordBCrypt :: Has Crypto sig m => Password -> m (PasswordHash BCrypt)
hashPasswordBCrypt = send . HashPasswordBCrypt

signJWT :: Has Crypto sig m => CustomClaims -> m JWS
signJWT = send . SignJWT

getRandomPassword  :: Has Crypto sig m => m Text
getRandomPassword = send GetRandomPassword

-- Carriers
newtype CryptoIOC m a = CryptoIOC {runCryptoIO :: ReaderC Text m a}
  deriving (Applicative, Functor, Monad, MonadIO, MonadFail)

runCryptoWithSecret :: Text -> CryptoIOC m hs -> m hs
runCryptoWithSecret secret = runReader secret . runCryptoIO

instance
  (MonadIO m, Algebra sig m) =>
  Algebra (Crypto :+: sig) (CryptoIOC m)
  where
  alg hdl sig ctx = CryptoIOC $ case sig of
    L (HashPasswordBCrypt pw) -> do
      (<$ ctx) <$> liftIO (hashPassword pw)
    L (SignJWT claims') -> do
      secret <- ask
      currentTime <- liftIO getCurrentTime
      let cs = mkJWTClaims currentTime claims'
          signer = hmacSecret secret
          encoded = pure $ JWS $ encodeSigned signer mempty cs
      (<$ ctx) <$> encoded
    L GetRandomPassword -> do
      pw <- liftIO generateRandomPassword
      pure ((<$ ctx) pw)
    R other -> alg (runCryptoIO . hdl) (R other) ctx
```

(One can slice the above differently, maybe `Password` and `JWS` effects -- but in my usage they tend to happen
together.)

**Summary** I'm happy with `fused-effects` in both projects I've worked on this year, but I'm sure `RIO`, a
small transformers stack, or one of the friendlier, "less powerful" effect libraries would be enough for
a web app. This seems to be a rather mercurial area in the community right now, but I do believe there's something
sensible in being explicit in separating the _how_ and the _what_ of the myriad side effects and app of this nature
can have.

## Building a Haskell API: talking to the Database

I love Postgres, even more after reading the extremely good [the Art of Postgress](https://theartofpostgresql.com/) book. I don't want an ORM that'll hide the DBMS from me: I'm not gonna move to a different one, and I quite enjoy writing SQL queries.
At my day job and in another backend I wrote for a Tarot app that my wife created, I use Clojure's [`hugsql`](https://www.hugsql.org/): you write the queries in a SQL file (you test them in `psql` with the `\i` or `\e` commands) and the library gives you functions that take maps and return vectors or maps. This is great except for the risks one takes at the interface: given that there's no types, you have to do map key bookkeeping yourself (we
use Clojure's [`spec`](https://clojure.org/guides/spec) at work,) but I'm philosophically dissatisfied -- for someone with a very limited capacity to
"carry a bunch of ad-hoc types in my head": it's too little, too late (optional, runtime.)

In the Haskell world, my first foray into some manner of database library was the `persistent`/`esqueleto` duet: I'm quite happy with them in a [little pilot API I built a couple of years ago](https://github.com/zrcadlo/undercurrent_api), but the template Haskell and agnosticism put me off: DB-agnosticism always means giving up some types, or some features, in Postgres, and that sucks. I wanted some type-safety and flexibility _throughout_ my program, a bit less so at the very edge of the DB interface, without pretending the DBMS doesn't exist. 

At the beginning of the year, I read [a blog post](https://www.williamyaoh.com/posts/2019-12-14-typesafe-db-libraries.html) comparing database libraries, and [Opaleye](https://github.com/tomjaguarpaw/haskell-opaleye) emerged as the winner; I decided to try it, and it does have what I want, and not much more: a type-safe way to express a subset of my database into domain entities and queries. The going is, I'm not gonna lie, a bit rough: from how exactly to express keys as newtypes, what the heck Product Profunctors are and how I can use them to not repeat myself, to some interesting arcana like which Haskell type best corresponds to Postgres's `timestamptz` [which led to me and Tom Ellis taking a deep dive into the matter](https://github.com/tomjaguarpaw/haskell-opaleye/issues/495#issuecomment-854056633). I think I've gotten the hang of Opaleye at this point, but if I were to start anew (or have time for a biggish refactor,) I'd use the excellent [rel8](https://hackage.haskell.org/package/rel8), which is based on Opaleye but makes some decisions on usage on one's behalf (the [introductory talk](https://www.youtube.com/watch?v=3uwrtjxiq6E) is fantastic, btw.)

Opaleye or Rel8 have an appeal for projects that will have a ton of entities and queries, and as such need a uniform way of representing and maintaining the database bits, without much risk for "clever" ad-hoc one-offs. When I wrote the effect handler for the database layer, in addition to the Opaleye functions, I also gave myself a generic `query` effect to send "raw SQL" to the underlying library (`postgresql-simple`,) in fact, in my much smaller supporting project for autocompleting city names, I knew a little bit of raw SQL would outweigh maintaining the more cumbersome opaleye magic, so that's [all I provided for that one](https://github.com/geocode-city/api/blob/a466540963b69e4d5ee46207bac984b07190c4ac/src/Effects/Database.hs). 

For medium projects, I would very much consider [`pg-entity`](https://github.com/tchoutri/pg-entity), which seems to also espouse my "ORMS suck, Postgres is great" ethos, in a much less product-profunctory package.

Also, honorable mention of David Spivak's idea of ["categorical databases"](https://www.youtube.com/watch?v=bk36__qkhrk), which is the theoretical basis for Opaleye. His [work](https://math.mit.edu/~dspivak/informatics/) on the subject is great, in fact, I greatly enjoyed the book he and Brendan Fong authored: ["Seven Sketches in Compositionality: an Invitation to Applied Category Theory"](https://arxiv.org/abs/1803.05316) -- all the way until the very tricky last chapter on topoi, it's a beautiful and approachable introduction to the world of category theory!

Here's some example code to e.g. define a `UserAccount` entity and a couple of queries -- the `Entity` bits are based on this [excellent repo that examplifies Opaleye and Morpheus usage](https://github.com/dandoh/web-haskell-graphql-postgres-boilerplate/blob/e673e9ee07ce7a4dd9b023328038664e8fdfdd78/src/Database/Base.hs)

```haskell
instance DefaultFromField SqlText (PasswordHash a) where
  defaultFromField = PasswordHash <$> defaultFromField

instance Default ToFields (PasswordHash a) (Column SqlText) where
  def = toToFields (\(PasswordHash txt) -> sqlStrictText txt)

newtype UserID' a = UserID a
  deriving newtype (Eq, Show)
  deriving Functor

$(makeAdaptorAndInstanceInferrable "pUserID" ''UserID')

type UserIDField = UserID' (Field SqlInt8)
type UserIDWrite = UserID' (Maybe (Field SqlInt8))
type UserID = UserID' Int64

data UserAccount' uid uname uemail upw =
  UserAccount
    { userID :: uid
    , userName :: uname
    , userEmail :: uemail
    , userPasswordHash :: upw
    }

type BCryptPasswordHash = PasswordHash BCrypt

type UserAccount =
  Entity
    (UserAccount'
      UserID
      (Maybe Text)
      (CI Text)
      BCryptPasswordHash)

type UserAccountWrite =
  EntityWriteField
    (UserAccount'
      UserIDWrite
      (FieldNullable SqlText)
      (Field SqlCitext)
      (Field SqlText))

type UserAccountField =
  EntityField
    (UserAccount'
      UserIDField
      (FieldNullable SqlText)
      (Field SqlCitext)
      (Field SqlText))

$(makeAdaptorAndInstanceInferrable "pUserAccount" ''UserAccount')

userAccountTable ::
  Table UserAccountWrite UserAccountField
userAccountTable =
  table "user_account" . pEntity . withTimestampFields $
    pUserAccount
      UserAccount
        { userID = pUserID (UserID $ optionalTableField "id")
        , userName = tableField "name"
        , userEmail = requiredTableField "email"
        , userPasswordHash = requiredTableField "password_hash"
        }

newUser :: Maybe Text -> Text -> BCryptPasswordHash -> Insert [(UserID, Maybe Text, CI Text)]
newUser name email pwHash =
  Insert
    { iTable = userAccountTable
    , iRows = withTimestamp [row]
    , iReturning = rReturning (\Entity{record} -> (userID record, userName record, userEmail record))
    , iOnConflict = Just DoNothing
    }
  where
    row =
      UserAccount
        (UserID Nothing)
        (toFields name)
        (toFields . mk $ email)
        (toFields pwHash)

-- | Get a user by email _including their password hash_
userByEmailForLogin :: Text -> Select (UserIDField, FieldNullable SqlText, Field SqlCitext, Field SqlText)
userByEmailForLogin email = do
  Entity{record} <- selectTable userAccountTable
  where_ $ userEmail record .=== (toFields . mk $ email)
  pure (userID record , userName record , userEmail record, userPasswordHash record)

```

**Summary** `Opaleye` is fearsome, but an elegant and clever foundation -- with the added bonus of having pushed me to finally read up on some category theory; `rel8` is likely the future. You probably can get by with `postgresql-simple` but try at least `pg-entity` to add some type safety without cruft. I admire `Persistent`/`Esqueleto`, but they remind me a bit too much of my Rails days of trying to fight the ORM to have it do what I _know_ Postgres is capable of doing.

## Building a Haskell API: repeatable development, and deployment.

Deploying Haskell is tough: for my projects, I use Heroku's [container support](https://devcenter.heroku.com/articles/container-registry-and-runtime). At first, I would build the Docker image locally and push it to Heroku. 
As dependencies grow, one has to get clever with build stages, the intricacies of Haskell's `stack` or `cabal`, and sometimes, just bite the bullet and wait for an hour or so while a transitive dependency on `lens` makes you realize that trying to push a tiny typo fix to some html template wasn't really worth it after all. I still use
a good ol' `Dockerfile` in [my oldest Haskell deployment](https://github.com/lfborjas/freenatalchart.xyz), but for the newer projects, I've been using `nix` to make both development and deployment less painful.

Again, just like with `Opaleye`, with power comes suffering. It took me quite some time to land at a derivation that worked both for development and deployment, as well as realizing one can use github actions to do the building
and pushing on one's behalf (negating the need for having Docker eat all your RAM, or having a virtualized linux
to build outside of Docker.) I owe much to [Gabriella Gonzalez's tutorial](https://github.com/Gabriel439/haskell-nix), this [monorepo](https://github.com/fghibellini/nix-haskell-monorepo) tutorial, and [this blog post that tied everything together](https://jade.fyi/blog/nix-and-haskell/). I believe I still have a ways to go towards Nix mastery, and I'm excited for flakes to simplify things, but I've already reaped quite a few benefits: much smaller docker images uploaded to Heroku, vastly shorter build times (from over an hour to ten minutes,) and the development boons such as the ability to work on WIP versions of libraries (for example, [here, in my lab repo](https://github.com/natal-chart/laboratorium/blob/6af2a8a5e33b0147048e48c79392e340cb70e6b6/nix/extra-pkgs/swiss-ephemeris.nix), I worked with a not-yet-published version of my C bindings to Swiss Ephemeris) or the ability to start working on any computer (that has the internet and the disk to bear the heavy Nix crown.)

Here's the `docker.nix` I have for [one of my projects](https://github.com/geocode-city/api/blob/a466540963b69e4d5ee46207bac984b07190c4ac/nix/docker.nix) to build a small, `alpine` based image for deployment:

```nix
{ pkgs ? import ./packages.nix { system = "x86_64-linux"; } }:

let
  bin = (pkgs.haskell.lib.justStaticExecutables pkgs.haskellPackages.geocode-city-api);
  migrations = ../migrations;
in

# This is the nix api to build images
pkgs.dockerTools.buildImage {
  # our image name
  name = "geocode-city-api";
  # our image tag
  tag = "latest";
  
  # this is a list of the things we want to include
  # in the image. it's incredibly bare by default.
  contents = [
    bin # our app
  ];
  fromImage = pkgs.dockerTools.pullImage {
    imageName = "alpine";
    imageDigest = "sha256:e1871801d30885a610511c867de0d6baca7ed4e6a2573d506bbec7fd3b03873f";
    sha256 = "0ymhp3hrhpf7425n3awz6b67510x9xcgpldi4xm610aqfk1rygy9";
  };
  extraCommands = ''
    cp -rf ${migrations} migrations
  '';

  # This exposes the Dockerfile commands you might be familiar with
  config = {
    Cmd = [ "${bin}/bin/geocode-city-api-exe" ];
    Env = [ 
      "DEPLOY_ENV=Production"
    ];
  };
}
``` 

Alongside this Github action to deploy it:

```yaml
name: "Build and Release to Heroku"
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2.3.4
    - uses: cachix/install-nix-action@v13
      with:
        nix_path: nixpkgs=channel:nixos-unstable
    - name: Login to Heroku Container Registry
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run:
        heroku container:login
    - name: Build with nix and load into docker 
      run: 
        docker load < $(nix-build ./nix/docker.nix)
    - name: Push to container Registry
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: |
        docker tag geocode-city-api:latest registry.heroku.com/geocode-city/web
        docker push registry.heroku.com/geocode-city/web
    - name:  Release
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run:
        heroku container:release web -a geocode-city
```

**Summary** Deploying Haskell can take a lot of time and more operations knowledge than the average developer probably knows to know, but Docker and Nix are a match made in... the cloud? I'm sorry.

# Story 2: Building a Haskell library

## Building a Haskell library: of C, memory corruption, and type-level programming.

In order to calculate _ephemeris_ (positions of planets at a given date, and miscellanea such as house cusps
for a given geographical location,) the golden standard is [Swiss Ephemeris](https://www.astro.com/swisseph/swephinfo_e.htm) a C library built by a couple of very hardcore, and very generous, C programmers who also run [astro.com](https://astro.com). Being able to access this battle-tested library through a higher-level library was the motivation for my authoring my own [C bindings to Swiss Ephemeris](https://github.com/lfborjas/swiss-ephemeris). At first, the task was rather perfunctory, albeit daunting: figure out how to import C headers into Haskell, write low-level signatures to send and receive C values, slap some simple -- but more expressive -- types on top: a few enumerations via Product types, a few "composite" types via Product (record, tuple) types, a lot of `IO (Either String x)`. 

For the app we're building, however, I needed to go a bit deeper: I needed to tweak some C to interface with an unofficial feature in `sweph` that can write "precalculated" ephemeris files into a rather optimized custom binary format, and read them in a memory efficient manner -- perfect for examining long intervals of time for transits or other events. Interfacing with _that_ meant coming to terms with the fact that Swiss Ephemeris converses in both "Ephemeris" (terrestrial) time, and Universal Time, and even though _they_ express them as a simple `double`, these are not values one wants to mix up. I originally had a humble newtype, without distinction between either time standard, because I only used one. To support "terrestrial time" as dictated by the existing code for precalculated ephemeris, I ended up doing a large (and painless, thanks Haskell!) refactor, engaging singletons and phantom types to make a `newtype` more typesafe, as well as _leveraging_ these singleton witnesses at runtime to choose which Swiss Ephemeris function to use. That led to a more sophisticated type than I originally had, here's a nugget:

```haskell
-- | Various standards for measuring time that can be expressed as
-- Julian Days.
data TimeStandard
  = -- | Terrestrial Time (successor to Ephemeris Time)
    TT
  | -- | Universal Time, explicitly in its @UT1@ form.
    UT1
  | -- | Universal Time, in any of its forms; depending
    -- on how it was constructed (in most cases, UTC)
    UT
  deriving (Eq, Show)

----------------------------------------------------------
--- SINGLETONS
-- thanks to: https://blog.jle.im/entry/introduction-to-singletons-1.html
-- if this gets more use, consider using the 'singletons' package:
-- https://hackage.haskell.org/package/singletons-3.0
----------------------------------------------------------
-- | Singletons for pseudo-dependent type programming with
-- time standards. 
data SingTimeStandard :: TimeStandard -> Type where
  STT :: SingTimeStandard 'TT
  SUT1 :: SingTimeStandard 'UT1
  SUT :: SingTimeStandard 'UT
  
-- | Typeclass to recover the singleton for a given time standard
class SingTSI a where
  singTS :: SingTimeStandard a 

instance SingTSI 'TT where
  singTS = STT
instance SingTSI 'UT1 where
  singTS = SUT1
instance SingTSI 'UT where
  singTS = SUT
 
-- | A @JulianDay@ can have different provenances, witnessed
-- by its accompanying phantom type:
--
-- * It could've been converted, purely, from a UTC value,
--   as such, its witness is 'UT'
-- * It could'be been produced by consulting tidal/leap second
--   information, as done by the Swiss Ephemeris library,
--   in which case it's 'TT' (aka, somewhat wrongly, as Ephemeris
--   time,) or 'UT1'.
newtype JulianDay (s :: TimeStandard) = MkJulianDay {
                                          -- | Get the underlying 'Double' in 
                                          -- a 'JulianDay'. We intentionally do /not/
                                          -- export a way to finagle a 'Double' into a
                                          -- 'JulianDay': you'll have to obtain it
                                          -- through the various temporal conversion functions.
                                          getJulianDay :: Double}
  deriving (Eq, Show, Enum, Ord)
```

Which allows us to write neat typeclasses such as:

```haskell
-- | Conversion from a 'JulianDay' in the 'TimeStandard'
-- @jd@ to a temporal value of type @to@
-- It's bound to IO since historical data may need to be consulted;
-- however, as per the underlying library, it /cannot/ fail.
class FromJulianDay jd to where
  fromJulianDay :: JulianDay jd -> IO to

instance FromJulianDay 'UT UTCTime where
  fromJulianDay = pure . julianDayUTToUTC

instance FromJulianDay 'UT1 UTCTime where
  fromJulianDay = julianUT1ToUTC

instance FromJulianDay 'TT UTCTime where
  fromJulianDay = julianTTToUTC
```

Note that I'm not using the [`singletons`](https://hackage.haskell.org/package/singletons-3.0) package there just yet, mostly because I'm stingy with which dependencies to bring into a library (everyone's invited to an app, though!) While we're here, [read the paper, it's pretty darn good](https://dl.acm.org/doi/10.1145/2364506.2364522).

The real magic is in being able to use a singleton to decide which function to invoke, here's an incomplete excerpt (one can dispense with the extra functions and just write the one that is eventually exported, `sunCrossing`, but I like to split these things
into painfully obvious chunks for the benefit of my future, dumber self):

```haskell
sunCrossingOpt
  :: SingTSI ts
  => CalcFlag
  -> Double
  -> JulianDay ts
  -> IO (Either String (JulianDay ts))
sunCrossingOpt =
  sunCrossingOpt' singTS

sunCrossingOpt'
  :: SingTimeStandard ts
  -> CalcFlag
  -> Double
  -> JulianDay ts
  -> IO (Either String (JulianDay ts))
sunCrossingOpt' sing iflag ln jd =
  let fn :: CDouble -> CDouble -> CalcFlag -> CString -> IO CDouble
      fn = case sing of
        -- raw C interface functions
        STT -> c_swe_solcross 
        _   -> c_swe_solcross_ut
      doubleJD = jd2C jd
  in allocaErrorMessage $ \serr -> do
    nextCrossing <-
      fn
        (realToFrac ln)
        doubleJD
        iflag
        serr
    if | nextCrossing < doubleJD && serr /= nullPtr ->
        Left <$> peekCAString serr
       | nextCrossing < doubleJD ->
        pure . Left $ "No crossing found in the future."
       | otherwise ->
        pure . Right $ mkJulianDay sing (realToFrac nextCrossing)

-- | Given an ecliptic longitude, and 'JulianDay' after which to search
-- try to find the next future date when the Sun will be crossing the
-- given longitude exactly (with a precision of 1 milliarcsecond,)
-- from a geocentric perspective.
sunCrossing :: SingTSI ts
 => Double
 -> JulianDay ts
 -> IO (Either String (JulianDay ts))
sunCrossing = sunCrossingOpt (mkCalculationOptions defaultCalculationOptions)
```

Singletons and phantom types aside, I'm not an expert C programmer, so even though I just took code from the swiss ephemeris source and forum and edited to play nice with environment variables and multithreading, I still managed to run into some memory corruption issues. Thankfully, the test suite for my library uses `QuickSpec` to really make the code suffer with a wide range of random inputs, and `HSpec`'s ability to have repeatable tests allowed me to zero in on either logical edge cases, or bad pointers to fix (I owe much to `valgrind` when helping actually track down where the memory corruption was happening!) See my [notes in the repo](https://github.com/lfborjas/swiss-ephemeris/blob/master/NOTES.md) for more. 

In fact, noodling around these timid extensions to Swiss Ephemeris allowed me to write some [original code](https://github.com/lfborjas/swiss-ephemeris/blob/169e3dfae41713e241d9cdba593e1a5dfde491ca/csrc/interpolate.c) to offer the ability to find exact moments of crossing or moon phases using numerical root finding, directly in C!

All these toils and travails resulted in probably [the biggest PR I've put together for a non-work repo](https://github.com/lfborjas/swiss-ephemeris/pull/37). All because I wanted the ability to see if we had a full moon coming up, or a fun (?) Mars square Moon.

***Summary*** C is fun until you get a `stackoverflow`, fear not the fancier types in Haskell if they'll lead to type-safer code.

## Building a Haskell library: experiments, streaming, the beauty of Monoids.

This section covers a repository that I'm in the midst of turning into a library, currently it's a [little CLI suite that produces some neat charts and text reports](https://github.com/natal-chart/laboratorium)

All of the above was simply the foundation for further code: I wanted to be able to, in one pass and with somewhat constant memory usage (I use the cheapo servers!), obtain the ephemeris for, say, a full month, and see if there's any planetary ingresses into a zodiac segment, changes of direction (direct to retrograde, and vice-versa,) as well as moon phases, transits and eclipses. Reading a lot of Haskell blog posts (in particular [this presentation by Gabriella Gonzalez](https://github.com/Gabriel439/slides/blob/main/munihac/foldmap.md),) I knew that this would be possible, but one had to align the types just right. One interesting challenge is that, as one encounters events such as transits, they may "happen" over multiple days, and it'd be neat to "merge" them into one event vs. multiple contiguous copies of the same event. After much experimentation, I ended up with types that look like this:

```haskell
class Merge a where
  merge :: a -> a -> MergeStrategy a

data MergeStrategy a
  = ReplaceBoth a a
  | ReplaceL a
  | ReplaceR a
  | Merge a
  | KeepBoth
  deriving (Eq, Show)

instance Functor MergeStrategy where
  fmap alpha (ReplaceBoth x y) = ReplaceBoth (alpha x) (alpha y)
  fmap alpha (ReplaceL x)      = ReplaceL (alpha x)
  fmap alpha (ReplaceR y)      = ReplaceR (alpha y)
  fmap alpha (Merge    z)      = Merge    (alpha z)
  fmap _     KeepBoth          = KeepBoth

newtype MergeSeq a =
  MergeSeq {getMerged :: S.Seq a}
  deriving stock (Show)
  deriving Foldable via S.Seq

singleton :: a -> MergeSeq a
singleton = MergeSeq . S.singleton

instance Merge a => Semigroup (MergeSeq a) where
  (MergeSeq s1) <> (MergeSeq s2) =
    MergeSeq $ doMerge s1Last s2First
    where
      s1Last  = S.viewr s1
      s2First = S.viewl s2
      doMerge EmptyR EmptyL    = mempty
      doMerge EmptyR (x :< xs) = x <| xs
      doMerge (xs :> x) EmptyL = xs |> x
      doMerge (xs :> x) (y :< ys) =
        case merge x y of
          ReplaceBoth a b -> (xs |> a) >< (b <| ys)
          Merge       a   -> (xs |> a) >< ys
          ReplaceL    a   -> (xs |> a) >< (y <| ys)
          ReplaceR      b -> (xs |> x) >< (b <| ys)
          KeepBoth        -> (xs |> x) >< (y <| ys)

instance Merge a => Monoid (MergeSeq a) where
  mempty = MergeSeq mempty
```

So one can write, for example (some code omitted, see the repo for full details):

```haskell
data Event
  = DirectionChange  PlanetStation
  | ZodiacIngress    (Crossing Zodiac)
  | HouseIngress     (Crossing House)
  | PlanetaryTransit (Transit Planet)
  | HouseTransit     (Transit House)
  | LunarPhaseChange LunarPhase
  | EclipseMaximum   Eclipse

data LunarPhase = LunarPhase
  { lunarPhaseName :: !LunarPhaseName
  , lunarPhaseStarts :: !JulianDayTT
  , lunarPhaseEnds :: !JulianDayTT
  } deriving (Eq, Show)

instance Merge LunarPhase where
  x `merge` y =
    if lunarPhaseName x == lunarPhaseName y then
      Merge merged
    else
      KeepBoth
    where
      merged = x {
        lunarPhaseEnds = lunarPhaseEnds y
      }

mapLunarPhases :: Seq (Ephemeris Double) -> MergeSeq Event
mapLunarPhases (day1 :<| day2 :<| _) =
  let sun1  = day1 `forPlanet` Sun
      sun2  = day2 `forPlanet` Sun
      moon1 = day1 `forPlanet` Moon
      moon2 = day2 `forPlanet` Moon
      sunPos = liftA2 (,) sun1 sun2
      moonPos = liftA2 (,) moon1 moon2
      phaseInfo = mkLunarPhase <$> sunPos <*> moonPos
      build (p, _changed) = LunarPhase p (epheDate day1) (epheDate day2)
  in maybe mempty (singleton . LunarPhaseChange . build) phaseInfo
mapLunarPhases  _ = mempty
```

And eventually reach the promised land, with a one-pass, memory efficient fold, using the [`streaming`](https://hackage.haskell.org/package/streaming-0.2.3.0) and [`foldl`](https://hackage.haskell.org/package/foldl) libraries in concert:

```haskell
worldAlmanac :: UTCTime -> UTCTime -> IO (Sq.Seq Event)
worldAlmanac start end = do
  Just ttStart <- toJulianDay start
  Just ttEnd   <- toJulianDay end
  Just utStart <- toJulianDay start
  Just utEnd   <- toJulianDay end
  let ephe = streamEpheJDF ttStart ttEnd
  (retro, cross, slowTransits, lun) :> _ <-
    ephe
    & ephemerisWindows 2
    & L.purely S.fold mkAlmanac

  pure $ retro <> cross <> slowTransits <> lun
  where
    mkAlmanac =
      (,,,) <$> L.foldMap getRetrogrades collapse
            <*> L.foldMap (getZodiacCrossings (tail defaultPlanets) westernZodiacSigns) collapse
            <*> L.foldMap (getTransits slowPairs) collapse
            <*> L.foldMap mapLunarPhases getMerged

-- some behind-the-scenes helpers:
streamEpheJD :: MonadIO m => (String -> m x)
  -> JulianDayTT
  -> JulianDayTT
  -> S.Stream (S.Of (Ephemeris Double)) m ()
streamEpheJD onError start end =
  S.each [start .. end]
  & S.mapM (liftIO . readEphemerisEasy False)
  & S.partitionEithers
  -- thanks, ocharles:
  -- https://www.reddit.com/r/haskell/comments/5x2g0r/streaming_package_vs_pipes_conduit_question_on/def39od?utm_source=share&utm_medium=web2x&context=3
  & S.mapM_ (lift . onError)

streamEpheJDF :: (MonadIO m, MonadFail m) => JulianDayTT -> JulianDayTT -> S.Stream (S.Of (Ephemeris Double)) m ()
streamEpheJDF = streamEpheJD fail

```

I believe there's further simplification to do here, in particular because as I actually _use_ this stuff, I don't
need the `Merge` bits as much if I only care about when events are _exact_, and it is a code smell that the
`Semigroup` instance for a sequence of merge-able events is not fully associative in its `mappend` implementation. But, the eventual fold
is _exactly_ what I needed, and wanted. I'm currently reading the [Monoids: theme and variations](https://dl.acm.org/doi/abs/10.1145/2430532.2364520) paper, and I believe there's more I can get from the humble Monoid to simplify this stuff than I've used thus far.

**Summary** Monoids changed my life, I'm a recovering typeclass addict.

# Conclusion

It all started with my wife and I wanting to build a mobile app successor to [freenatalchart.xyz](https://freenatalchart.xyz), with more interactivity and a calendar of events, and I ended up _really_ diving deep into some of the richest (and sometimes, scariest) recesses of Haskell: using `nix` to develop and deploy, testing the green fields of graphql support and type-safe but dbms-unafraid database access, writing (and breaking) quite a bit of C and interfacing to it with actually pretty elegant (and semantically useful!) Haskell types, and facing head on the age-old problem of "how do I look at a ton of data without blowing time _or_ space too much," via the beauty of streaming, folds, and the humble semigroups+monoids. I still have quite a bit of code to write, but I'm very much enjoying the ride -- this level of yak shaving would have been long abandoned in a more loosely typed language, even if more "mature" libraries are available for some of the pain points I mentioned above.
