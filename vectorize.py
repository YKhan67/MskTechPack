import cv2
import numpy as np
import sys

def process_image(input_path, output_svg_path):
    # Load image
    img = cv2.imread(input_path)
    if img is None:
        print(f"Error: Could not read image {input_path}")
        return

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Bilateral filter to remove noise while keeping edges sharp
    gray = cv2.bilateralFilter(gray, 9, 75, 75)

    # Canny Edge Detection
    edges = cv2.Canny(gray, 50, 150)

    # Dilation to close gaps
    kernel = np.ones((3,3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)
    edges = cv2.erode(edges, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Generate SVG
    height, width = edges.shape
    with open(output_svg_path, 'w') as f:
        f.write(f'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n')
        f.write(f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">\n')
        for contour in contours:
            if len(contour) > 2:
                path_data = "M " + " L ".join([f"{p[0][0]},{p[0][1]}" for p in contour]) + " Z"
                f.write(f'  <path d="{path_data}" fill="none" stroke="black" stroke-width="1" />\n')
        f.write('</svg>\n')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 vectorize.py <input_path> <output_svg_path>")
    else:
        process_image(sys.argv[1], sys.argv[2])
