import requests
import json
import sys
import csv
import re
import nltk
from nltk.stem import WordNetLemmatizer
lem = WordNetLemmatizer()

def ocr_space_file(filename, overlay=False, api_key='K83280661788957', language='eng'):
    payload = {'isOverlayRequired': overlay,
               'apikey': api_key,
               'language': language,
               }
    with open(filename, 'rb') as f:
        r = requests.post('https://api.ocr.space/parse/image',
                          files={filename: f},
                          data=payload,
                          )
    return r.content.decode()

def find_matching_sentences(filename):
    # Input File:
    test_file = ocr_space_file(filename=sys.argv[1], language='eng')
    data = test_file
    parsed_data = json.loads(data)
    # Extracting the ParsedText
    parsed_text = parsed_data["ParsedResults"][0]["ParsedText"]
    words_to_remove = ["dr","do","is","that","mg","for","on","pm","am","tablet","and","no","a","b","c","d","e","f","g","h","i","j","/","with","or","(",")",".","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","acid"]
    medicine_names = [line.strip() for line in parsed_text.split('\n')]
    words = "".join(medicine_names)
    cleaned_text = re.sub(r'\d+(\.\d+)?', '', words)
    cleaned_text = re.sub(r'[\[\]{}()%.]', '', cleaned_text)
    words = "".join(cleaned_text)
    main_words = words.split()
    filtered_words = [word for word in main_words if word.lower() not in words_to_remove]
    # Joining the filtered words back into a string
    filtered_words = [lem.lemmatize(word) for word in filtered_words]
    result_string = " ".join(filtered_words)
    mylist = []
    flag = False
    with open("medicine_data.csv", mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            full_sentence = row["Med_Name"]
            for word in result_string.split():
                for i in full_sentence.split():
                    if ((word.isalpha() != 0) and (word.isdigit() != 1) and word.lower() == i.lower() and (word.lower() != 'tablet' and word.lower() != 'mg') and word.lower() not in words_to_remove):
                        mylist.append(full_sentence)
                        flag = True
                        break
    myset = {i for i in mylist}
    return myset

matched_sentences = find_matching_sentences(filename=sys.argv[1]) #List of all Medicine names
print(matched_sentences)





