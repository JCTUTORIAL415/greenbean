
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback

app = Flask(__name__)
CORS(app)  # 啟用 CORS

# 初始化報告數據存儲（模擬資料庫）
reports = []

# 確保 uploads 目錄存在
if not os.path.exists('uploads'):
    os.makedirs('uploads')


@app.route('/submit_report', methods=['POST'])
def submit_report():
    try:
        # 提取表單數據
        datetime = request.form['datetime']
        location = request.form['location']
        people_count = request.form['peopleCount']
        
        # description 是可選的
        description = request.form.get('description', '')  # 默認為空字符串

        # 獲取上傳的檔案
        files = request.files.getlist('fileInput')
        file_urls = []

       
        # 檢查是否有上傳檔案，若有則儲存
        if files:
            for file in files:
                file_path = os.path.join('uploads', file.filename)
                file.save(file_path)
                file_urls.append(file_path)
        
        # 儲存報告數據
        report_data = {
            'id': len(reports)+ 1,
            'datetime': datetime,
            'location': location,
            'peopleCount': people_count,
            'description': description,
            'photos': file_urls
        }

        reports.append(report_data)

        app.logger.info(f"新報告已接收並儲存: {report_data}")
        return jsonify(success=True, message="報告已成功提交", report=report_data)

    except Exception as e:
        error_details = traceback.format_exc()
        app.logger.error(f"提交報告時發生錯誤: {error_details}")
        return jsonify(success=False, error=str(e)), 500


@app.route('/get_reports', methods=['GET'])
def get_reports():
    try:
        # 回傳目前所有報告
        app.logger.info(f"返回報告清單，共 {len(reports)} 條")
        return jsonify(reports=reports)

    except Exception as e:
        error_details = traceback.format_exc()
        app.logger.error(f"獲取報告清單時發生錯誤: {error_details}")
        return jsonify(success=False, error=str(e)), 500

# 啟動 Flask 伺服器
if __name__ == '__main__':
    app.run(debug=True)

