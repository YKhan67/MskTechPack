import cv2
import numpy as np
import sys

def process_image(input_path, output_svg_path):
    img = cv2.imread(input_path)
    if img is None:
        print(f"Error: Could not read image {input_path}")
        return

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Pre-processing
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Edge detection
    edges = cv2.Canny(gray, 50, 150)
    
    # Hough Line Transform (Probabilistic)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=20, maxLineGap=10)
    
    height, width = edges.shape
    with open(output_svg_path, 'w') as f:
        f.write(f'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n')
        f.write(f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">\n')
        
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                f.write(f'  <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="black" stroke-width="1.5" />\n')
        
        # Also add contours for curves, but simplified
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_TC89_L1)
        for contour in contours:
            if cv2.contourArea(contour) > 10: # Only significant contours
                # Simplify contour
                epsilon = 0.01 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                if len(approx) > 2:
                    path_data = "M " + " L ".join([f"{p[0][0]},{p[0][1]}" for p in approx]) + " Z"
                    f.write(f'  <path d="{path_data}" fill="none" stroke="black" stroke-width="1" opacity="0.5" />\n')
                    
        f.write('</svg>\n')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 vectorize.py <input_path> <output_svg_path>")
    else:
        process_image(sys.argv[1], sys.argv[2])
