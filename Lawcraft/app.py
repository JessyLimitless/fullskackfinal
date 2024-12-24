import openai
import faiss
import numpy as np
from langchain_community.embeddings import OpenAIEmbeddings  # 경로 변경됨
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # CORS 문제 해결

# Flask 앱 생성
app = Flask(__name__)
CORS(app)  # CORS 허용

# OpenAI API 키 설정
OPENAI_API_KEY = ''
openai.api_key = OPENAI_API_KEY

# 임베딩을 위한 OpenAIEmbeddings 객체 생성
embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)

# FAISS 인덱스 생성 (벡터 차원: 1536)
faiss_index = faiss.IndexFlatL2(1536)  # 벡터 차원이 1536이라고 가정

# 텍스트 파일을 지정된 경로에서 읽어오는 함수
def read_text_from_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

# 임베딩 및 유사도 검색을 위한 함수
def generate_contract_from_file(user_input, file_path):
    try:
        document = read_text_from_file(file_path)
        document_embedding = embeddings.embed_documents([document])
        document_vector = np.array(document_embedding).astype('float32')
        faiss_index.add(document_vector.reshape(1, -1))
        user_input_embedding = embeddings.embed_documents([user_input])
        user_input_vector = np.array(user_input_embedding).astype('float32')
        D, I = faiss_index.search(user_input_vector.reshape(1, -1), k=1)
        similar_text = document if I[0][0] != -1 else "유사한 계약서를 찾을 수 없습니다."

        prompt = f"""
        너는 계약 전문 변호사야. 내가 제공한 정보를 바탕으로 포괄적이고 법적으로 유효한 계약서를 작성해줘.
        계약서에는 모든 법적 요구사항과 세부사항을 포함시켜야 해.

        사용자 요청: "{user_input}"

        참고: {similar_text}
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a contract lawyer who creates legally valid contracts based on user input."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500
        )

        contract_text = response['choices'][0]['message']['content'].strip()

        return contract_text

    except Exception as e:
        print(f"오류 발생: {e}")
        return "계약서를 생성하는 동안 오류가 발생했습니다."

# 경로 설정
file_path = r"C:\Users\j0708\Desktop\Lawcraft\근로계약서.txt"

# 라우트: index.html 파일 제공
@app.route('/')
def index():
    return send_file('index.html')

# 계약서 생성 API
@app.route('/generate_contract', methods=['POST'])
def generate_contract():
    user_input = request.json.get('user_input')

    if not user_input:
        return jsonify({'error': '입력된 내용이 없습니다.'}), 400

    contract = generate_contract_from_file(user_input, file_path)

    return jsonify({
        'message': '계약서가 성공적으로 생성되었습니다.',
        'contract': contract
    })

if __name__ == '__main__':
    app.run(debug=True)
