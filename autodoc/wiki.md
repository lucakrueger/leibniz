
## Range


### Range

> ```
> Range -> start end => list
> ```
>
> Generates a range between two values with a step size of one
>
>- `start` Starting number
>- `end` Ending number
>
> **Returns** `list`

### Range

> ```
> Range -> start end step => list
> ```
>
> Generates a range between two values using a specific step size
>
>- `start` Starting number
>- `end` Ending number
>- `step` Step size
>
> **Returns** `list`

## Strings


### Chars

> ```
> Chars -> s => list
> ```
>
> Splits a string into its characters
>
>- `s` Any string
>
> **Returns** `list`

### Split

> ```
> Split -> st target => list
> ```
>
> Splits a string into multiple parts
> The division is done by searching for a specific target
>
>- `st` Any string
>- `target` Target at which the string should be splitted
>
> **Returns** `list`

### Remove

> ```
> Remove -> str target => string
> ```
>
> Removes any instance of a specific character from a string
>
>- `str` Any string
>- `target` Any character
>
> **Returns** `string`

### Find

> ```
> Find -> str target => number | none
> ```
>
> Finds a specific character in a string
> Returns the index of the first instace found
>
>- `str` Any string
>- `target` Any character
>
> **Returns** `number | none`

### Findls

> ```
> Findls -> str target => list
> ```
>
> Finds a specific character in a string
> Returns all indices where an instance was found
>
>- `str` Any string
>- `target` Any character
>
> **Returns** `list`

## Expressions


### if

> ```
> if -> cond result else => any
> ```
>
> Checks if value is true or false
>
>- `cond` Boolean
>- `result` Return value if cond is true
>- `else` Return value if cond is false
>
> **Returns** `any`

### if

> ```
> if -> cond result => any | none
> ```
>
> Checks if value is true or false
>
>- `cond` Boolean
>- `result` Return value if cond is true
>
> **Returns** `any | none`

### for

> ```
> for -> max fun => list
> ```
>
> A functional for loop starting at index zero
>
>- `max` Max value for index
>- `fun` Function takes elem index list result
>
> **Returns** `list`

## List


### Head

> ```
> Head -> ls => any | none
> ```
>
> Get head of a list
>
>- `ls` A list
>
> **Returns** `any | none`

### Tail

> ```
> Tail -> ls => list
> ```
>
> Get tail of a list
>
>- `ls` A list
>
> **Returns** `list`

### Search

> ```
> Search -> ls target => number | none
> ```
>
> Searches list for a target
> Returns index where target is found
>
>- `ls` A list
>- `target` Any value
>
> **Returns** `number | none`

### Searchls

> ```
> Searchls -> ls target => list
> ```
>
> Searches list for a target
> Returns all indices where target is found
>
>- `ls` A list
>- `target` Any value
>
> **Returns** `list`

### for

> ```
> for -> ls start end f => list
> ```
>
> Go over list
> Executes a function with the current element
>
>- `ls` A list
>- `start` Start index
>- `end` End index
>- `f` Function. takes elem index list result
>
> **Returns** `list`

### Length

> ```
> Length -> ls => number
> ```
>
> Get length of a list
>
>- `ls` A list
>
> **Returns** `number`

### qsort

> ```
> qsort -> ls => list
> ```
>
> Sorts a list using quicksort
>
>- `ls` A list
>
> **Returns** `list`

### Reverse

> ```
> Reverse -> ls => list
> ```
>
> Reverses a list
>
>- `ls` A list
>
> **Returns** `list`

### Shift

> ```
> Shift -> ls => list
> ```
>
> Shifts a list to the left by one
>
>- `ls` A list
>
> **Returns** `list`

### Index

> ```
> Index -> ls i => any
> ```
>
> Get value of element in list by index
>
>- `ls` A list
>- `i` Index
>
> **Returns** `any`

### Last

> ```
> Last -> ls => any | none
> ```
>
> Get last element of a list
>
>- `ls` A list
>
> **Returns** `any | none`

### Join

> ```
> Join -> ls => any
> ```
>
> Joins all elements of a list
>
>- `ls` A list
>
> **Returns** `any`

## Trig


### sind

> ```
> sind -> x => number
> ```
>
> Sine in degrees
>
>- `x` Number
>
> **Returns** `number`

### cosd

> ```
> cosd -> x => number
> ```
>
> Cosine in degrees
>
>- `x` Number
>
> **Returns** `number`

### tand

> ```
> tand -> x => number
> ```
>
> Tan in degrees
>
>- `x` Number
>
> **Returns** `number`

### sinr

> ```
> sinr -> x => number
> ```
>
> Sine in rad
>
>- `x` Number
>
> **Returns** `number`

### cosr

> ```
> cosr -> x => number
> ```
>
> Cosine in rad
>
>- `x` Number
>
> **Returns** `number`

### tanr

> ```
> tanr -> x => number
> ```
>
> Tan in rad
>
>- `x` Number
>
> **Returns** `number`

### arsin

> ```
> arsin -> x => number
> ```
>
> Arcsine in rad
>
>- `x` Number
>
> **Returns** `number`

### degreeToRad

> ```
> degreeToRad -> x => number
> ```
>
> Converts degrees to rad
>
>- `x` Number
>
> **Returns** `number`

### degreeToRad

> ```
> degreeToRad -> x => number
> ```
>
> Converts rad to degrees
>
>- `x` Number
>
> **Returns** `number`

## Maths


### Set

> ```
> Set -> ls => true | false
> ```
>
> Check if a set is valid
>
>- `ls` List
>
> **Returns** `true | false`

### Sum

> ```
> Sum -> j n f => number
> ```
>
> Goes over range and sums all results by function
>
>- `j` Starting number
>- `n` Ending number
>- `f` Function takes elem index array result
>
> **Returns** `number`

### Sumls

> ```
> Sumls -> ls => number
> ```
>
> Goes over a list and sums all values
>
>- `ls` A list
>
> **Returns** `number`

### Product

> ```
> Product -> j n f => number
> ```
>
> Goes over range and multiplies all results by function
>
>- `j` Starting number
>- `n` Ending number
>- `f` Function takes elem index array result
>
> **Returns** `number`

### Prodcutls

> ```
> Prodcutls -> ls => number
> ```
>
> Goes over a list and multiplies all values
>
>- `ls` A list
>
> **Returns** `number`

## Map


### Map

> ```
> Map => map
> ```
>
> Creates a Map
>
>
> **Returns** `map`

### Set

> ```
> Set -> map key value => map
> ```
>
> Set a key from a map to a value
>
>- `map` A map
>- `key` Key name
>- `value` Any value
>
> **Returns** `map`

### Get

> ```
> Get -> map key => any
> ```
>
> Get a value from map by key name
>
>- `map` A map
>- `key` Key name
>
> **Returns** `any`

## Random


### Random

> ```
> Random -> min max => number
> ```
>
> Generates random number from a range
>
>- `min` Minimum
>- `max` Maximum
>
> **Returns** `number`

### Randomls

> ```
> Randomls -> length min max => list
> ```
>
> Generates a list random number from a range
>
>- `length` List length
>- `min` Minimum
>- `max` Maximum
>
> **Returns** `list`

## Enum


### enum

> ```
> enum -> values => enum
> ```
>
> Create an enum
>
>- `values` Either a list containing all keys or a two dimensional list containing keys and their corresponding values
>
> **Returns** `enum`

### isEnum

> ```
> isEnum -> value enum => any | none
> ```
>
> Checks if value is part of an Enum
>
>- `value` Any value
>- `enum` An Enum
>
> **Returns** `any | none`