from flask import Flask, request, jsonify, send_file
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
import openai

# Flask 앱 생성
app = Flask(__name__)

# OpenAI API 키 설정
OPENAI_API_KEY = ''  # 보안 이유로 여기에 직접 키를 입력하지 않는 것이 좋습니다.
openai.api_key = OPENAI_API_KEY

# 문서를 로드하는 함수
def load_text(file):
    text = file.read().decode('utf-8')
    return text

# 라우트 1: 메인 페이지
@app.route('/')
def index():
    return send_file('index.html')

# 라우트 2: 파일 업로드 및 질문에 대한 답변 처리
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    document = load_text(file)
    documents = [{"text": document}]

    # 문서 임베딩 생성
    embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
    vector_store = FAISS.from_texts([doc["text"] for doc in documents], embeddings)

    # 사용자의 질문을 받아 처리
    question = request.form.get('question')
    
    if question:
        llm = ChatOpenAI(api_key=OPENAI_API_KEY, model="gpt-3.5-turbo")
        qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_store.as_retriever(), chain_type="stuff")
        answer = qa_chain({"query": question})
        return jsonify({'result': answer['result']})
    
    return jsonify({'error': '파일과 질문이 필요합니다.'})

if __name__ == '__main__':
    app.run(debug=True)
