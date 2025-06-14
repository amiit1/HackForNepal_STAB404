from PIL import Image
from PIL.ExifTags import TAGS
import sys

def analyze_image_depth_and_info(image_path):
    """
    Analyzes an image to find whether it likely has depth information
    and extracts other essential information.

    Args:
        image_path (str): The path to the image file.

    Returns:
        None: Prints the analysis to the console.
    """
    try:
        img = Image.open(image_path)
        print(f"--- Image Analysis for: {image_path} ---")

        # Essential Information
        print("\n--- Basic Information ---")
        print(f"Format: {img.format}")
        print(f"Size (Width x Height): {img.size[0]} x {img.size[1]}")
        print(f"Mode: {img.mode}")  # e.g., RGB, RGBA, L (grayscale)

        has_depth_info = False
        depth_info_details = []

        # 1. Check EXIF data for depth-related tags
        exif_data = img._getexif()
        if exif_data:
            print("\n--- EXIF Data ---")
            exif_readable = {TAGS.get(key, key): value for key, value in exif_data.items()}
            found_exif_data = False
            for tag, value in exif_readable.items():
                found_exif_data = True
                # Print some common/interesting tags
                if tag in ['Make', 'Model', 'DateTime', 'Software', 'LensMake', 'LensModel', 'FNumber', 'ExposureTime', 'ISOSpeedRatings']:
                    print(f"{tag}: {value}")
                
                if isinstance(tag, str) and "depth" in tag.lower():
                    has_depth_info = True
                    depth_info_details.append(f"EXIF tag '{tag}' found: {value}")
                
                if tag == 'SubjectDistanceRange': # Indicates distance to subject (not exactly depth map)
                    # This tag gives a general idea but isn't a depth map itself.
                    # Value 0: unknown, 1: macro, 2: close view, 3: distant view
                    depth_info_details.append(f"EXIF 'SubjectDistanceRange' found: {value} (0=unknown, 1=macro, 2=close, 3=distant)")
                elif tag == 0xA431: # Tag for 'SerialNumber' often, but check if some devices use similar custom tags for depth info
                    pass # Example of checking a specific numeric tag if known
            
            if not found_exif_data:
                print("No standard EXIF tags found or decoded.")
        else:
            print("\n--- EXIF Data ---")
            print("No EXIF data found in this image.")

        # 2. Check img.info dictionary (might contain format-specific metadata)
        if img.info:
            print("\n--- Image Info Dictionary (Metadata) ---")
            for key, value in img.info.items():
                # print(f"Info Key: {key}, Value: {str(value)[:100]}") # Print all for inspection
                if isinstance(key, str) and "depth" in key.lower():
                    has_depth_info = True
                    depth_info_details.append(f"Image.info key '{key}' found.")
                # Example for some PNGs storing depth in a specific chunk
                if key.lower() == 'depth_map' or key.lower() == 'disparity_map':
                    has_depth_info = True
                    depth_info_details.append(f"Image.info key '{key}' found, indicating potential depth data.")
        else:
            print("\n--- Image Info Dictionary (Metadata) ---")
            print("No additional info dictionary found in this image.")

        # 3. For formats like HEIC/HEIF, depth maps can be stored as auxiliary images.
        # Pillow's handling of this can vary. More advanced parsing might be needed.
        if img.format in ["HEIF", "HEIC"]:
            # This is a placeholder. Accessing auxiliary images (like depth maps) in HEIF
            # might require iterating through frames if `img.is_animated` or `img.n_frames > 1`,
            # or checking specific properties. Pillow's support for HEIF metadata can be limited
            # without specific plugins (like pillow-heif).
            # For now, we'll just note it.
            depth_info_details.append(f"Image is {img.format} format, which can contain depth maps as auxiliary images. Advanced parsing might be needed.")


        # Conclusion on Depth Information
        print("\n--- Depth Information Summary ---")
        if has_depth_info:
            print("Depth information is LIKELY PRESENT based on the following indicators:")
            for detail in depth_info_details:
                print(f"- {detail}")
        else:
            print("No direct indicators of depth information were found with basic checks.")
            if depth_info_details: # Print any heuristic notes
                 for detail in depth_info_details:
                    print(f"- Note: {detail}")
            print("Depth information can be stored in proprietary ways not covered by this script (e.g., within specific MakerNotes in EXIF, or as separate files/streams).")


    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
    except Exception as e:
        print(f"An error occurred while processing '{image_path}': {e}")
    finally:
        if 'img' in locals() and hasattr(img, 'close'):
            img.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path_to_test = sys.argv[1]
        analyze_image_depth_and_info(image_path_to_test)
    else:
        print("Usage: python image_analyzer.py <path_to_image_file>")
        # Example: Create a dummy image for a quick test if no path is given
        try:
            dummy_img = Image.new('RGB', (60, 30), color = 'blue')
            dummy_img.save("dummy_test_image.png")
            print("\nNo image path provided. Running analysis on a dummy 'dummy_test_image.png':")
            analyze_image_depth_and_info("dummy_test_image.png")
        except Exception as e:
            print(f"Could not create or analyze dummy image: {e}")