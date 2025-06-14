import os
import xml.etree.ElementTree as ET
from PIL import Image
import numpy as np
import tensorflow as tf
import keras
from keras.models import Model
from keras.layers import Dense, GlobalAveragePooling2D, Dropout
from keras.applications import MobileNetV2 # Using MobileNetV2 as an example
# from tensorflow.keras.preprocessing.image import ImageDataGenerator # For on-the-fly augmentation
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping, ModelCheckpoint # Added Callbacks
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# --- Configuration ---
IMAGE_DIR = 'dir' # Main directory containing class folders (e.g., dir/folder1, dir/folder2)
IMG_WIDTH, IMG_HEIGHT = 224, 224 # Target image size for the model input
BATCH_SIZE = 32
EPOCHS = 100 # Number of times to iterate over the entire training dataset - Increased to 100
VALIDATION_SPLIT = 0.2 # Percentage of data to use for validation (e.g., 0.2 means 20%)
MODEL_CHECKPOINT_PATH = 'best_image_classifier_model.keras' # Path to save the best model

def load_and_preprocess_data(base_dir):
    """
    Loads images, parses XMLs for bounding boxes, crops, resizes, and preprocesses images.
    The class label is derived from the subfolder name.
    """
    images = []
    labels = []
    
    # Get class names from the subdirectories in base_dir
    class_names = sorted([d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))])
    
    if not class_names:
        print(f"Error: No subdirectories (class folders) found in '{base_dir}'.")
        print("Please ensure your data is structured as 'dir/class1_folder', 'dir/class2_folder', etc.")
        return np.array([]), np.array([]), []

    print(f"Found class folders: {class_names}")

    for class_name in class_names:
        class_path = os.path.join(base_dir, class_name)
        print(f"Processing class: {class_name}")
        file_count = 0
        for item_name in os.listdir(class_path):
            # Process only common image file types
            if item_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                img_path = os.path.join(class_path, item_name)
                # Construct corresponding XML file path
                xml_filename = os.path.splitext(item_name)[0] + '.xml'
                xml_path = os.path.join(class_path, xml_filename)

                if not os.path.exists(xml_path):
                    print(f"Warning: XML file '{xml_path}' not found for image '{img_path}'. Skipping this image.")
                    continue

                try:
                    # Parse XML for bounding box
                    tree = ET.parse(xml_path)
                    root = tree.getroot()
                    
                    obj_element = root.find('object')
                    if obj_element is None:
                        print(f"Warning: No <object> tag found in '{xml_path}'. Skipping this image.")
                        continue
                    
                    bndbox = obj_element.find('bndbox')
                    if bndbox is None:
                        print(f"Warning: No <bndbox> tag found in <object> in '{xml_path}'. Skipping this image.")
                        continue

                    xmin = int(bndbox.find('xmin').text)
                    ymin = int(bndbox.find('ymin').text)
                    xmax = int(bndbox.find('xmax').text)
                    ymax = int(bndbox.find('ymax').text)

                    # Load image
                    img = Image.open(img_path).convert('RGB') # Ensure image is in RGB
                    
                    # Crop image using bounding box
                    img_cropped = img.crop((xmin, ymin, xmax, ymax))
                    
                    # Resize cropped image
                    img_resized = img_cropped.resize((IMG_WIDTH, IMG_HEIGHT), Image.LANCZOS) # Use LANCZOS for quality
                    
                    img_array = np.array(img_resized)
                    
                    images.append(img_array)
                    labels.append(class_name) # Folder name is the class label
                    file_count += 1

                except ET.ParseError:
                    print(f"Warning: Could not parse XML file '{xml_path}'. Skipping related image.")
                except FileNotFoundError:
                    print(f"Warning: Image file '{img_path}' (referenced in XML or listing) not found. Skipping.")
                except ValueError as ve: # Catch issues like invalid text in xmin etc.
                     print(f"Warning: Invalid data in XML '{xml_path}' (e.g., non-integer for bbox): {ve}. Skipping.")
                except Exception as e:
                    print(f"Error processing image '{img_path}' or XML '{xml_path}': {e}. Skipping.")
        print(f"Loaded {file_count} images for class '{class_name}'.")
    
    if not images:
        print("Error: No images were successfully loaded. Please check paths, file formats, and XML content.")
        return np.array([]), np.array([]), []

    # Convert images list to numpy array and preprocess for MobileNetV2
    images_np = np.array(images, dtype=np.float32)
    images_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(images_np) 

    # Encode string labels to numerical format (integers)
    label_encoder = LabelEncoder()
    labels_encoded = label_encoder.fit_transform(labels)
    # Convert numerical labels to one-hot encoded vectors
    labels_categorical = tf.keras.utils.to_categorical(labels_encoded, num_classes=len(class_names))
    
    return images_preprocessed, labels_categorical, label_encoder.classes_

def build_model(num_classes, input_shape):
    """Builds a classification model using MobileNetV2 as a base."""
    # Load MobileNetV2 pre-trained on ImageNet, without the top classification layer
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=input_shape)
    
    # Freeze the layers of the base model so they are not trained initially
    base_model.trainable = False 
    
    # Add custom layers on top of MobileNetV2
    x = base_model.output
    x = GlobalAveragePooling2D()(x) # Reduces spatial dimensions
    x = Dense(1024, activation='relu')(x) # A fully connected layer
    x = Dropout(0.5)(x) # Dropout for regularization to prevent overfitting
    predictions = Dense(num_classes, activation='softmax')(x) # Output layer with softmax for multi-class classification
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile the model
    model.compile(optimizer=Adam(learning_rate=0.001), 
                  loss='categorical_crossentropy', # For multi-class classification
                  metrics=['accuracy'])
    return model

def main():
    print("Step 1: Loading and preprocessing data...")
    images, labels, class_names_loaded = load_and_preprocess_data(IMAGE_DIR)

    if images.size == 0:
        print("No data was loaded. Please check your IMAGE_DIR and data structure. Exiting.")
        return

    num_classes = len(class_names_loaded)
    print(f"\nSuccessfully loaded {len(images)} images belonging to {num_classes} classes.")
    
    if num_classes == 0:
        print("No classes found. Cannot train a model. Exiting.")
        return
    if num_classes == 1:
        print("Warning: Only one class was found. Training a classifier requires at least two distinct classes.")
        # Consider exiting or specific handling if only one class. For now, will proceed but training won't be meaningful.

    print(f"Shape of image data array: {images.shape}") # (num_samples, height, width, channels)
    print(f"Shape of label data array: {labels.shape}")   # (num_samples, num_classes)

    # Step 2: Split data into training and validation sets
    print("\nStep 2: Splitting data into training and validation sets...")
    x_train, x_val, y_train, y_val = train_test_split(
        images, labels, 
        test_size=VALIDATION_SPLIT, 
        random_state=42, # For reproducibility
        stratify=labels if num_classes > 1 else None # Ensure class proportions are similar in train/val splits
    )
    print(f"Training samples: {len(x_train)}, Validation samples: {len(x_val)}")

    if len(x_train) == 0:
        print("Error: No training samples after splitting. Check dataset size and validation split. Exiting.")
        return
    
    # It's crucial to have validation data for EarlyStopping and ModelCheckpoint to work effectively
    if len(x_val) == 0:
        print("Warning: No validation samples after splitting. EarlyStopping and ModelCheckpoint based on validation metrics will not function correctly. Consider reducing VALIDATION_SPLIT or increasing dataset size.")
        # Training will proceed, but callbacks monitoring 'val_loss' or 'val_accuracy' will not trigger as expected.


    # Step 3: Build the model
    print("\nStep 3: Building the model...")
    model_input_shape = (IMG_HEIGHT, IMG_WIDTH, 3)
    model = build_model(num_classes=num_classes, input_shape=model_input_shape)
    model.summary() # Print model architecture

    # Step 4: Define Callbacks
    print("\nStep 4: Defining callbacks (EarlyStopping and ModelCheckpoint)...")
    
    callbacks_list = []
    if len(x_val) > 0: # Only add callbacks if there is validation data
        early_stopping = EarlyStopping(
            monitor='val_loss', # Monitor validation loss
            patience=10,        # Number of epochs with no improvement after which training will be stopped
            verbose=1,
            restore_best_weights=True # Restores model weights from the epoch with the best value of the monitored quantity.
        )
        callbacks_list.append(early_stopping)

        model_checkpoint = ModelCheckpoint(
            filepath=MODEL_CHECKPOINT_PATH, # Path where to save the model
            monitor='val_loss',          # Monitor validation loss
            save_best_only=True,         # If True, the latest best model according to the quantity monitored will not be overwritten.
            verbose=1
        )
        callbacks_list.append(model_checkpoint)
    else:
        print("Skipping EarlyStopping and ModelCheckpoint as there is no validation data.")


    # Step 5: Train the model
    print("\nStep 5: Starting model training...")
    history = model.fit(
        x_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(x_val, y_val) if len(x_val) > 0 else None,
        callbacks=callbacks_list if callbacks_list else None, # Pass the list of callbacks
        verbose=1
    )
    print("Training finished.")

    # Step 6: Evaluate the model (optional, as fit() already shows validation metrics)
    # If EarlyStopping restored best weights, this evaluation will be on those best weights.
    if len(x_val) > 0:
        print("\nStep 6: Evaluating model on validation set (potentially with best weights restored by EarlyStopping)...")
        loss, accuracy = model.evaluate(x_val, y_val, verbose=0)
        print(f"Validation Accuracy: {accuracy*100:.2f}%")
        print(f"Validation Loss: {loss:.4f}")

    # Step 7: Save the final model (or the best one if not using ModelCheckpoint with restore_best_weights)
    # If ModelCheckpoint was used, the 'best_image_classifier_model.keras' already holds the best version.
    # If EarlyStopping with restore_best_weights=True was used, the current `model` object has the best weights.
    # Saving it again here ensures the model is saved even if ModelCheckpoint wasn't the primary way of getting the best model.
    final_model_save_path = 'final_image_classifier_model.keras'
    model.save(final_model_save_path)
    print(f"\nFinal model (potentially best weights) saved to {final_model_save_path}")
    if os.path.exists(MODEL_CHECKPOINT_PATH):
        print(f"The best model during training was also saved to: {MODEL_CHECKPOINT_PATH}")


    print("\nClass mapping (index to name) used by the model:")
    for i, name in enumerate(class_names_loaded):
        print(f"Index {i}: {name}")

def create_dummy_data_if_needed():
    """Creates a dummy directory structure and files if IMAGE_DIR doesn't exist."""
    if not os.path.exists(IMAGE_DIR):
        print(f"'{IMAGE_DIR}' not found. Creating a dummy structure for demonstration...")
        os.makedirs(IMAGE_DIR, exist_ok=True)
        
        classes_data = {
            "class_A": ("red", "objectA"),
            "class_B": ("blue", "objectB")
        }

        for class_name_folder, (color, xml_obj_name) in classes_data.items():
            class_folder_path = os.path.join(IMAGE_DIR, class_name_folder)
            os.makedirs(class_folder_path, exist_ok=True)
            
            for i in range(1, 11): # Create 10 dummy images and XMLs per class for better split
                img_filename = f"img{i}.jpg"
                xml_filename = f"img{i}.xml"
                
                # Create dummy image
                img = Image.new('RGB', (200, 150), color=color)
                img.save(os.path.join(class_folder_path, img_filename))
                
                # Create dummy XML
                xml_content = f'''<annotation>
    <folder>{class_name_folder}</folder>
    <filename>{img_filename}</filename>
    <path>dummy/path/{img_filename}</path>
    <source><database>Unknown</database></source>
    <size><width>200</width><height>150</height><depth>3</depth></size>
    <segmented>0</segmented>
    <object>
        <name>{xml_obj_name}</name>
        <pose>Unspecified</pose>
        <truncated>0</truncated>
        <difficult>0</difficult>
        <bndbox><xmin>10</xmin><ymin>10</ymin><xmax>190</xmax><ymax>140</ymax></bndbox>
    </object>
</annotation>'''
                with open(os.path.join(class_folder_path, xml_filename), 'w') as f:
                    f.write(xml_content)
        print(f"Dummy structure created in '{IMAGE_DIR}' with folders: {list(classes_data.keys())}.")
        print(f"Each folder contains 10 dummy images and their corresponding .xml files.")
        print(f"IMPORTANT: Replace '{IMAGE_DIR}' with your actual data directory or populate '{IMAGE_DIR}' appropriately for real training.")


if __name__ == '__main__':
    create_dummy_data_if_needed() # Creates dummy data if 'dir' doesn't exist
    main()