import sys
import json
import tensorflow as tf
import cv2
import numpy as np

image_path = sys.argv[1]
model = tf.keras.models.load_model('../../models/dyslexia_scanner_new.keras')

img = cv2.imread(image_path)
resize = tf.image.resize(img, (256, 256))
yhat = model.predict(np.expand_dims(resize / 255, 0))

features = {
    "dyslexia_probability": float(yhat[0][0])
}

print(json.dumps(features))