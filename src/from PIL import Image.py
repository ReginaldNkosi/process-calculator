from PIL import Image
from PIL.ExifTags import TAGS

def get_exif_data(image_path):
    # Open the image file
    with Image.open(image_path) as img:
        # Attempt to extract EXIF metadata
        exif_data = img._getexif()  
        
        if exif_data is not None:
            # Convert EXIF tag IDs to tag names
            exif_dict = {}
            for tag_id, value in exif_data.items():
                tag_name = TAGS.get(tag_id, tag_id)
                exif_dict[tag_name] = value
            return exif_dict
        else:
            return {}

if __name__ == "__main__":
    image_file = "C:\Users\USER\Downloads\unnamed.jpg"
    exif = get_exif_data(image_file)
    
    # EXIF might contain many fields, but we're interested in date/time
    # For example:
    date_time_original = exif.get("DateTimeOriginal", "No DateTimeOriginal found")
    print(f"Date/Time Original: {date_time_original}")
