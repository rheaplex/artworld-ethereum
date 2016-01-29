# Bitmaps

# Text

Utf-8.

# Colours

24-bit CIELAB.

# Paths

Paths are encoded in three bytes:

    opcode, param1, param2

Three uint256 variables of these names can be used to store up to 32 path
elements.

## Opcodes

### No params

01 - New Path
10 - Close Path

### One param

32 - Repeat next instruction n times (param1)

### Two Params

01 - Move To x, y (param1, param2)
02 - Relative Move To +x, +y (param1, param2)
03 - Line To x, y (param1, param2)
04 - Relative Line To +x, +y (param1, param2)

### Four params

Two sets of param1, param2, with opcode set to zero.

05 - Curve To x1, y1, x, y (param1, param2, param1, param2)
06 - Curve To x1, y1, x, y (param1, param2, param1, param2)

