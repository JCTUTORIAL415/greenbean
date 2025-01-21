
    // 儲存勾選的案件資料
    const selectedCases = new Set();

    // 監聽勾選框的變化
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox')) {
            const row = e.target.closest('tr');
            const caseId = e.target.value;

            if (e.target.checked) {
                selectedCases.add(caseId);
                row.classList.add('selected');
            } else {
                selectedCases.delete(caseId);
                row.classList.remove('selected');
            }

            // 顯示或隱藏送出按鈕
            const submitButtonContainer = document.getElementById('submit-button-container');
            if (selectedCases.size > 0) {
                submitButtonContainer.style.display = 'block';
            } else {
                submitButtonContainer.style.display = 'none';
            }
        }
    });

    // 顯示輸入帳號的彈窗
    function showInputModal() {
        if (selectedCases.size === 0) {
            alert('請選擇至少一個案件！');
            return;
        }
        document.getElementById('inputModal').style.display = 'block';
    }

    // 關閉彈窗
    function closeInputModal() {
        document.getElementById('inputModal').style.display = 'none';
    }

    // 模擬提交帳號 ID 和案件資料
    function submitAccountId() {
        const accountId = document.getElementById('accountId').value.trim();

        if (!accountId) {
            alert('請輸入帳號 ID！');
            return;
        }

        // 模擬提交的資料
        const casesArray = Array.from(selectedCases);
        console.log("帳號 ID:", accountId);
        console.log("選中的案件資料:", casesArray);

        // 模擬更新表格狀態
        casesArray.forEach(caseId => {
            const row = document.querySelector(`tr td input[value="${caseId}"]`).closest('tr');
            row.querySelector('.status').textContent = '已轉交';
            row.querySelector('.status').classList.remove('status-new');
            row.querySelector('.status').classList.add('status-assigned');
            row.querySelector('input.checkbox').disabled = true; // 禁止再次選取
        });

        // 清空選取及隱藏送出按鈕
        selectedCases.clear();
        document.getElementById('submit-button-container').style.display = 'none';
        closeInputModal();
    }




function filterByRegion() {
    const selectedRegion = document.getElementById('regionSelector').value.trim();
    const rows = document.querySelectorAll('#casesTable tbody tr');

    rows.forEach(row => {
        const region = row.getAttribute('data-region') || ''; // 確保 `region` 不為 null
        if (selectedRegion && !region.includes(selectedRegion)) {
            row.style.display = 'none'; // 隱藏不符合的行
        } else {
            row.style.display = ''; // 顯示符合的行
        }
    });
}


