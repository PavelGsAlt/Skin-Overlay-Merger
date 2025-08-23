# Overlays.zip File Structure

This document explains the required structure for the `Overlays.zip` file that contains all overlay files for the Minecraft Skin Overlay Merger.

## Required File Structure

Your `Overlays.zip` file should be structured as follows:

```
Overlays.zip
├── wizard_hat/
│   ├── slim.png
│   └── normal.png
├── cool_glasses/
│   ├── slim.png
│   └── normal.png
├── red_cape/
│   ├── slim.png
│   └── normal.png
├── crown/
│   ├── slim.png
│   └── normal.png
└── watch/
    ├── slim.png
    └── normal.png
```

## File Requirements

### Overlay Folders
- Each overlay must be in its own folder
- Folder names will be shown as overlay names in the browser
- Use descriptive, lowercase names with underscores (e.g., `wizard_hat`, `cool_glasses`)

### Image Files
- **Required formats**: PNG files only
- **Skin types**: Each overlay folder should contain:
  - `slim.png` - For slim/Alex model skins
  - `normal.png` - For normal/Steve model skins
- **Optional**: If only one skin type is available, name it appropriately
- **File size**: Maximum 10MB per image file
- **Dimensions**: Should match Minecraft skin dimensions (64×64 or 64×32)

## Example Overlays

### Wizard Hat (`wizard_hat/`)
```
wizard_hat/
├── slim.png    (wizard hat for slim skins)
└── normal.png  (wizard hat for normal skins)
```

### Cool Glasses (`cool_glasses/`)
```
cool_glasses/
├── slim.png    (glasses for slim skins)
└── normal.png  (glasses for normal skins)
```

### Red Cape (`red_cape/`)
```
red_cape/
├── slim.png    (cape for slim skins)
└── normal.png  (cape for normal skins)
```

## ZIP File Requirements

- **File name**: Must be named `Overlays.zip`
- **Location**: Place in the root of your website (same folder as `index.html`)
- **Maximum size**: 100MB total
- **Compression**: Any standard ZIP compression is supported

## Creating the ZIP File

### Method 1: Manual Creation
1. Create a folder structure as shown above
2. Add your PNG overlay files to the appropriate folders
3. Select all overlay folders
4. Right-click and choose "Send to > Compressed folder" (Windows) or "Compress" (macOS)
5. Rename the ZIP file to `Overlays.zip`

### Method 2: Command Line
```bash
# Create the directory structure
mkdir -p overlays/{wizard_hat,cool_glasses,red_cape,crown,watch}

# Add your PNG files to each folder
# ...

# Create the ZIP file
cd overlays
zip -r ../Overlays.zip .
```

## Best Practices

### Naming Conventions
- Use lowercase folder names
- Replace spaces with underscores
- Use descriptive names (e.g., `wizard_hat` not `hat1`)
- Avoid special characters and numbers at the start

### Image Quality
- Use PNG format for transparency support
- Optimize file sizes without losing quality
- Ensure images are properly aligned for Minecraft skins
- Test overlays with both slim and normal base skins

### Organization
- Group similar overlays (all hats, all accessories, etc.)
- Use consistent naming across overlay types
- Include both slim and normal versions when possible
- Remove any test or backup files before zipping

## File Validation

The application automatically validates:
- ✅ File format (PNG only)
- ✅ File size (under 10MB per file)
- ✅ Folder structure
- ✅ Image accessibility

Invalid files are automatically skipped with warnings in the console.

## Deployment

1. Create your `Overlays.zip` file following the structure above
2. Place it in your website's root directory
3. Deploy your website
4. Test the overlay browser to ensure all overlays load correctly

## Troubleshooting

### "No overlays found" Error
- Check that your ZIP file is named exactly `Overlays.zip`
- Verify the folder structure matches the requirements
- Ensure PNG files are in individual overlay folders

### "Failed to load overlays" Error
- Check that `Overlays.zip` is accessible from your website
- Verify file size is under 100MB
- Test the ZIP file can be opened manually

### Missing Overlays
- Check console for file validation warnings
- Ensure PNG files are not corrupted
- Verify folder names don't contain special characters

## Example Download

For reference, you can create a sample structure like this:

```
sample_overlays/
├── wizard_hat/
│   ├── slim.png     (64x64 PNG with wizard hat overlay)
│   └── normal.png   (64x64 PNG with wizard hat overlay)
└── sunglasses/
    ├── slim.png     (64x64 PNG with sunglasses overlay)
    └── normal.png   (64x64 PNG with sunglasses overlay)
```

Then zip the contents (not the folder itself) to create `Overlays.zip`.