from flask import Flask, jsonify, request
import tensorflow as tf
from PIL import Image
import numpy as np
import pandas as pd
import pytesseract
import os

app = Flask(__name__)

pathToTesseract = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

# Read the CSV file into a DataFrame
df = pd.read_csv('modelProductList.csv')

# Get the unique values in the 'Product' column
class_labels = df['Product'].unique()




@app.route('/predict', methods=['POST'])
def predict():
    # Load TensorFlow Lite model
    interpreter_front = tf.lite.Interpreter(model_path="ARC_Model_Front_1.tflite")
    interpreter_front.allocate_tensors()
    input_details = interpreter_front.get_input_details()
    output_details = interpreter_front.get_output_details()
    
   # Get front input data from the request
    front_image = Image.open(request.files['front_image'])
    front_image.save("front_image.png") # save image as png
    front_image = Image.open("front_image.png")

    # Get back input data from the request
    back_image = Image.open(request.files['back_image'])
    back_image.save("back_image.png") # save image as png
    back_image = Image.open("back_image.png")
    
    pytesseract.tesseract_cmd = r"pathToTesseract"
    text = pytesseract.image_to_string(front_image)

    # Read the CSV file into a DataFrame
    df = pd.read_csv('ARCProductList.csv')

    # Split the text into a list of words
    words = text.split()

    product = None
    
    # Iterate over the words with a sliding window
    for i in range(len(words)):
        for j in range(i+1, len(words)+1):
            product = " ".join(words[i:j])
            if df[(df['Product'] == product)].empty:
                continue
            else:
                # Get the rows where the 'Product' column is equal to the word
                row = df[(df['Product'] == product)]
                confidence = 0.99
                product = row['Product']
                brand = row['Brand']
                thc = row['THC']
                cbd = row['CBD']
                strain = row['Type']
    #END OF OCR CODE   
                
    if product is None:
        # Perform inference on front image
        input_data_front = np.array(front_image).reshape(1, input_details[0]['shape'][1], input_details[0]['shape'][2], input_details[0]['shape'][3])
        interpreter_front.set_tensor(input_details[0]['index'], input_data_front)
        interpreter_front.invoke()
        front_predictions = interpreter_front.get_tensor(output_details[0]['index'])

        # Get the class with the highest probability
        class_index = np.argmax(front_predictions[0])

        # Get the class label
        class_label = class_labels[class_index]

        # Get the probability of the highest class
        confidence = front_predictions[0][class_index]
        
        # Get the rows where the 'Product' column is equal to the predicted class label
        row = df.loc[df['Product'] == class_label]

        product = row['Product']
        brand = row['Brand']
        thc = row['THC']
        cbd = row['CBD']
        strain = row['Type']
    #END OF ML CODE


       
    # Return the product details as a JSON response
    return jsonify({"confidence": confidence,
                    "product": product,
                    "brand": brand,
                    "thc": thc,
                    "cbd": cbd,
                    "strain": strain})
    
if __name__ == "__main__":
    app.run(debug=True)