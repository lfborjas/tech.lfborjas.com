+++
title = "Meandering through JSON with Optics"

[taxonomies]
tags = ["haskell", "optics", "json"]
+++

When working with third-party services, one is more likely than not to end up parsing
a JSON document. For well-behaved APIs, documentation and examples are available, so the job
usually becomes some minor variation of:

1. Reach for the "canonical" JSON parsing library in your language
2. Grab some example JSON and do some ad-hoc parsing of the bits you're interested in,
3. Maybe write a class/type/module/namespace to immortalize adapting said JSON data to your domain, hopefully with accompanying tests.
4. Think everything is okay, until some live data comes in with missing keys (or extra keys!) inconsistent types (nulls where they promised they wouldn't show up, invalid date
formats, etc.)
5. Go back to step 2 with the newfound edge cases, adapt.

Sometimes it's a quick process: couple of caveats you missed in the documentation, sometimes
it's painstaking; the ability to close the loop in a fast, but robust, manner becomes invaluable: you don't want to spend days, and a lot of boilerplate, only to discover that some deep details didn't really work out. I believe a good type system and a good parser help a lot, but the last mile is all about the "getting to the bits of data relevant to your domain." Optics are my tool of choice for that.

<!-- more -->

As a fun example, we're going to be parsing a response from my [Astral Arcanum](http://www.lfborjas.com/astral-arcanum-demo/) API (which is technically a GraphQL API, so a more appropriate route would be to use something like [`morpheus`](https://morpheusgraphql.com/client).) But, it's an easy to understand API with responses that can get deeply nested, so we'll roll with it.

I'll include snippets of code relevant to the discussion, but you can take a peek
at [the full module on Github](https://github.com/lfborjas/json-optics-playground/blob/f689fcb007fca82e317bdd2536edb0c2fceaab8c/src/JsonOpticsPractice/Horoscope.hs).

# Parsing JSON

The canonical library here is of course [`aeson`](https://hackage.haskell.org/package/aeson-1.5.6.0). And a straightforward approach is to define a record that corresponds to each object in the JSON structure, for example, for the "planet position" in the JSON:

```json
  {
    "planet": "Sun",
    "speed": {
      "unSplit": 1.0196359986110741
    },
    "longitude": {
      "zodiacSign": "Capricorn"
    },
    "houseNumber": {
      "label": "IC"
    }
  }
```

We have a pretty 1-to-1 Haskell type:

```haskell
data PlanetPosition = PlanetPosition
  { planet :: Planet
  , speed :: SpeedData
  , longitude :: LongitudeData
  , houseNumber :: HouseData
  }
  deriving (Show, Generic, FromJSON)
```

Where `speed`, `longitude` and `houseNumber` have their respective types, too.

## Deriving FromJSON

Aeson [lists a few options](https://hackage.haskell.org/package/aeson-1.5.6.0/docs/Data-Aeson.html#t:FromJSON) for writing `FromJSON` instances:

* Manually, with some help from `withObject` to implement the `parseJSON` method. This option is useful if the JSON is truly a pain to cleanly map to Haskell types and one would rather do some "massaging" of the data before constructing a Haskell value. Note that there's also [`genericParseJSON`](https://hackage.haskell.org/package/aeson-1.5.6.0/docs/Data-Aeson.html#v:genericParseJSON) if the "manual" part is something rather uniform that can be addressed by tweaking the default options, e.g., dropping a prefix or transforming the casing of the keys.
* [Using Template Haskell](https://hackage.haskell.org/package/aeson-1.5.6.0/docs/Data-Aeson-TH.html). Which, at the time of writing, is said to "probably be more efficient than \[generics\].) The `TemplateHaskell` pragma is required in this case.
* Lastly, if one's type truly needs no massaging, the default implementation works if
the type derives `Generic` -- you can either provide an explicitly empty instance (i.e. `instance FromJSON PlanetPosition`,) to accept the default method implementations, or add
the `DeriveAnyClass` pragma to be able to do as I did in the example above and list it alongside other derive-able classes. Optionally, `DerivingStrategies` can be a nice way
to explicitly indicate that one wants the [`derive anyclass` strategy to apply.](https://kowainik.github.io/posts/deriving#any-class-derivations)

For truly big APIs, [I have indeed gone the Template Haskell route](https://github.com/lfborjas/orpheus/blob/3c37229564a672e445d90b5d1d0b5e62f79454a3/backend/src/Vision.hs), which allows for some customization that makes it place nicely with `Lens` conventions.

When dealing with less-than-pretty third party services, I usually write manual instances with either `genericParseJSON` or the more bespoke
`withObject` "massaging" route. Sometimes even [going as low-level as writing parsers](https://github.com/lfborjas/freenatalchart.xyz/blob/8822f9e27ff685c629d39bbf8e14eddb40d7e77d/src/ExternalServices/Geonames.hs#L64-L82) for truly wild APIs. 

For smaller or more well-behaved JSON, [I've gone for the empty instance + `Generic` route](https://github.com/lfborjas/senex/blob/d8e917bedf2b97084f01913914fe7786be108186/src/Geo.hs), mostly because [I ran into a _runtime_ issue](https://github.com/lfborjas/orpheus/blob/3c37229564a672e445d90b5d1d0b5e62f79454a3/backend/src/Api.hs#L37-L42) I couldn't explain (or find answers for!) at the time with the `DeriveAnyClass` strategy. I only learned right now that the Template Haskell route may prove to be more efficient, so I'd probably go with that in a larger codebase. 

For this example, it looks quite neat to
be able to just throw `ToJSON` in there alongside other classes we're `deriving` without any additional instantiating incantations -- though
I could easily be convinced to list the deriving strategy explicitly for extra maintenance clarity! And I was glad to see that whatever error I ran into before is not a problem in newer versions of Aeson (or maybe GHC itself? I truly wish I'd found why my old instance went awry!)

Hopefully you see from the above examples (and the excellent Aeson documentation,) that a lot of "ugly" JSON can be dealt with right [at the parsing stage](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/), so your types don't become unergonomic -- or worse, values or "shapes" that should've been dealt with at the parsing stage end up infecting your business logic (e.g. not parsing a date value, letting it into your domain logic as a string, and then having to parse it deep in some handler or background task!)

As an example of handling things as the right type at the right moment -- parsing -- a [previous version](https://github.com/lfborjas/json-optics-playground/commit/885b5f4f0d8d6e30418ab1fb73526aed3a9a13e8) of this code treated `Planet` values as Strings. But as soon as the business logic needs to start dealing with the concept of a `Planet`, having transacted
them as strings becomes a liability. We can do better, and promote them to a real domain type with `FromJSON` instance that leverages the `Read` instance:

```haskell
data Planet
  = Sun
  | Moon
  | Mercury
  | Venus
  | Mars
  | Jupiter
  | Saturn
  | Uranus
  | Neptune
  | Pluto
  | MeanNode
  | TrueNode
  | MeanApog
  | OscuApog
  | Earth
  | Chiron
  deriving (Show, Read)

instance FromJSON Planet where
  parseJSON = withText "Planet" $ \s -> 
    case readMaybe (T.unpack s) of
      Nothing -> fail "Invalid Planet"
      Just p -> pure p
```

Also, while developing, I like to run functions with some example data, and the quasi-quoting module that [ships with Aeson](https://hackage.haskell.org/package/aeson-2.0.3.0/docs/Data-Aeson-QQ-Simple.html) proved useful in [keeping a little example
payload around](https://github.com/lfborjas/json-optics-playground/blob/f689fcb007fca82e317bdd2536edb0c2fceaab8c/src/JsonOpticsPractice/Horoscope.hs#L125) to send to my functions without having to wrangle Strings.

# Optics 

## To wrangle data

As I've [said before](/optics/), being able to compose optics as ways of dealing with data
in a certain way, allows for great reusability and flexibility; dealing with deeply
nested data has always been touted as The Big Thing, and it definitely applies here.

One thing I _don't_ like in standard `Lens` practice, is having to define my records with an underscore prefix so the generated optics get the "real" names. Fortunately, the `optics` package is able to [generically produce optics that use `OverloadedLabels`](https://hackage.haskell.org/package/optics-core-0.4/docs/Optics-Label.html), and since I was already using generics in this example, adding the `OverloadedLabels` pragma to get optics that are easier to distinguish from regular accessor functions seemed like a win! (You'll note that the `optics` documentation _also_ suggests TemplateHaskell over the Generic instance for larger codebases.) This route also has the felicitous side-effect of making
records easier to work with. If you're not familiar with `optics`, the following examples show a few types and interesting functions/combinators, and the fact that composing
optics is done via the `%` operator, not `.` -- which is [by design](https://hackage.haskell.org/package/optics-0.4/docs/Optics.html#g:4).

For example, we may often be filtering positions by zodiac sign, so we can come up with an optic that abstracts that:

```haskell
inSign :: String -> Optic' A_Fold '[()] (Maybe Horoscope) PlanetPosition
inSign signName = 
  _Just 
  % #planetPositions
  % folded 
  % filteredBy (#longitude % #zodiacSign % only signName)
```

And use it in, e.g., a function that finds the house of each planet in a sign:

```haskell
-- >>> runReader withHouse dataDecoded
-- [(Sun,"IC"),(Moon,"III"),(Saturn,"III"),(Uranus,"III"),(Neptune,"III")]
withHouse :: Reader (Maybe Horoscope) [(Planet, String)]
withHouse = do
  magnifyMany (inSign "Capricorn") $ do
    pl <- gview #planet
    magnify #houseNumber $ do
      lbl <- gview #label
      return [(pl, lbl)]
```

Or, in a less contrived example, we can locally reuse an optic to both modify a datum
and obtain it:

```haskell
setRetrograde :: SpeedData -> SpeedData
setRetrograde d@SpeedData{unSplit} =
  if unSplit > 0 then d{unSplit = negate unSplit} else d

-- >>> madeRetrograde2
-- [-1.0196359986110741,-13.947422051450813,-1.1903897069829164,-1.251451014550458,-0.5273338733007417,-4.477182214727865e-2,-0.11711016716347317,-5.89714837583241e-2,-3.7757418150684646e-2,-2.328425047258476e-2,-5.2901520421361925e-2,-0.11093337702602891,-6.345430815724024e-2]
madeRetrograde2 :: [Double]
madeRetrograde2 = 
  dataDecoded 
  & speedOpt %~ setRetrograde
  & toListOf (speedOpt % #unSplit)
  where
    speedOpt :: Traversal' (Maybe Horoscope) SpeedData
    speedOpt = _Just % #planetPositions % traversed % #speed
```
(N.B. `setRetrograde` itself could be written using optics... but I still maintain
that whenever there's a straightforward "normal" way to write something, the cognitive burden
that optics introduce for maintainers is probably not worth it.)

Above, you'll have noticed uses of optics provided by the [`Zoom`](https://hackage.haskell.org/package/optics-extra-0.4/docs/Optics-Zoom.html) module. It makes it
extremely convenient to work with optics in a more "imperative" manner without
having to be writing long one-liners all the time, or when having to focus on
more than one datum on each "step." For example, here's it put to use to find all
planets in each house: 

```haskell
-- >>> runReader groupedInHouses dataDecoded
-- AccumMap (fromList [("Desc",[Mars]),("IC",[Sun,Mercury]),("II",[Pluto]),("III",[Moon,Venus,Saturn,Uranus,Neptune]),("IX",[Chiron]),("V",[MeanNode]),("VIII",[Jupiter]),("XII",[OscuApog])])
groupedInHouses :: Reader (Maybe Horoscope) (AccumMap String [Planet])
groupedInHouses = do
  magnifyMany (_Just % #planetPositions % folded) $ do
    houseLbl <- gview (#houseNumber % #label)
    pl <- gview #planet
    pure . AccumMap $ M.fromList [(houseLbl, [pl])]
```

Each value "observed" by `magnifyMany` is monoidally appended to the resulting value, which
uses this little "accumulating map" I wrote, that mimicks python's [`defaultdict`](https://docs.python.org/3/library/collections.html#collections.defaultdict):

```haskell
newtype AccumMap k v = AccumMap (M.Map k v)
  deriving (Show)

instance (Ord k, Monoid v) => Semigroup (AccumMap k v) where
  AccumMap a <> AccumMap b = AccumMap $ M.unionWith (<>) a b
  
instance (Ord k, Monoid v) => Monoid (AccumMap k v) where
  mempty = AccumMap mempty
```

The Zoom module also gives us optic utilities for the `State` monad, like this more monadic version of `makeRetrograde`:

```haskell
makeRetrograde :: State (Maybe Horoscope) ()
makeRetrograde = do
  zoomMany (_Just % #planetPositions % traversed) $ do
    modifying #speed setRetrograde
```

## To aid with parsing

One surprising application of optics in this example module is that it can also help in the parsing stage: the payload only gets interesting within the `data.horoscope` path in the payload, and it seemed silly to write a `Response` type with only one field (`data`,) that could only be of type `Horoscope`, so I used the instances from the [`aeson-optics`](https://hackage.haskell.org/package/aeson-optics-1.1.1/docs/Data-Aeson-Optics.html) package to aid with that:

```haskell
dataDecoded :: Maybe Horoscope
dataDecoded =
  -- using the `Ixed Value` instance from aeson-optics.
  -- note that `key` also works!
  fromJSONValue =<< (testData ^? ix "data" % ix "horoscope")
  where
    fromJSONValue = parseMaybe parseJSON

testData :: Value
testData = [aesonQQ|
{
  "data": {
    "horoscope": {
      "planetPositions": [
        {
          "planet": "Sun",
          "speed": {
            "unSplit": 1.0196359986110741
          },
          "longitude": {
            "zodiacSign": "Capricorn"
          },
          "houseNumber": {
            "label": "IC"
          }
        }
      ]
    }
  }
}
|]
```

# Parting words

Being able to deal with the idiosyncrasies of whatever JSON comes your way via the flexibility afforded by `aeson` (and `aeson-optics`,) and Haskell's ability to derive
boilerplate; as well as `optics` to delve deep into data in a reusable, robust manner is a pretty winning combination. Both libraries boast excellent documentation and usable
compiler errors to guide your way, so the inevitable refactoring that comes with integrating
with a third party is made rather painless.

One interesting discovery as I was working through this, was to refer to [this excellent blog post by Chris Penner on the same subject](https://chrispenner.ca/posts/traversal-systems), where he uses `lens`: a lot of examples here are inspired by that blog post, but I ended up running into some interesting philosophical disagreements between `lens`, where "everything goes" for the sake of productivity, and `optics`, where unsound/incompatible operations are made impossible by the "opaque" implementation. I'll explore the differences in a future blog post, using [my translation](https://github.com/lfborjas/json-optics-playground/blob/main/src/JsonOpticsPractice/GeneralizingTraversals.hs) of Chris's examples.
