let primarySelection = ''; // 儲存第一個選項
let secondarySelection = ''; // 儲存第二個選項


// 開啟第一個模態視窗
function openModal() {
    document.getElementById('expenseModal').style.display = 'block';
}

// 關閉第一個模態視窗
function closeModal() {
    document.getElementById('expenseModal').style.display = 'none';
}

// 確認主要選擇並開啟第二個模態視窗
function confirmSelection() {
    const selectedOption = document.querySelector('#expenseModal input[name="expense"]:checked');
    if (selectedOption) {
        primarySelection = selectedOption.value; // 儲存第一個選擇的值
    } else {
        primarySelection = '未選擇';
    }

    closeModal(); // 關閉第一個視窗
    openSecondaryModal(); // 開啟第二個模態視窗
}

// 開啟第二個模態視窗
function openSecondaryModal() {
    document.getElementById('secondaryModal').style.display = 'block';
}

// 關閉第二個模態視窗
function closeSecondaryModal() {
    document.getElementById('secondaryModal').style.display = 'none';
}

// 確認二次選擇並更新費用類別欄位
function confirmSecondarySelection() {
    const selectedOption = document.querySelector('#secondaryModal input[name="secondary-option"]:checked');
    if (selectedOption) {
        secondarySelection = selectedOption.value; // 儲存第二個選擇的值
    } else {
        secondarySelection = '未選擇';
    }

    // 將兩個選項顯示在費用類別欄位
    document.getElementById('expense-category').value = `${primarySelection} / ${secondarySelection}`;

    closeSecondaryModal(); // 關閉第二個視窗
}

// 點擊模態對話框外部時關閉對話框
window.onclick = function(event) {
    const expenseModal = document.getElementById('expenseModal');
    const secondaryModal = document.getElementById('secondaryModal');

    if (event.target === expenseModal) {
        closeModal();
    } else if (event.target === secondaryModal) {
        closeSecondaryModal();
    }
};


// 打開帳本名稱模態視窗
function openAccountModal() {
    document.getElementById('accountModal').style.display = 'block';
}

// 關閉帳本名稱模態視窗
function closeAccountModal() {
    document.getElementById('accountModal').style.display = 'none';
}

// 確認帳本選擇
function confirmAccountSelection() {
    const selectedAccount = document.querySelector('#accountModal input[name="account"]:checked');
    if (selectedAccount) {
        document.getElementById('account-name').value = selectedAccount.value;
    }
    closeAccountModal(); // 關閉模態視窗
}

// 點擊模態對話框外部關閉對話框
window.onclick = function(event) {
    const accountModal = document.getElementById('accountModal');
    if (event.target === accountModal) {
        closeAccountModal();
    }
};

// 打開商品批號模態視窗
// 開啟商品批號模態視窗
function openProductModal() {
    document.getElementById('productModal').style.display = 'block';
}

// 關閉商品批號模態視窗
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// 確認選擇商品批號
function confirmProductSelection() {
    const selectedProduct = document.querySelector('input[name="product"]:checked');
    if (selectedProduct) {
        document.getElementById('productNum').value = selectedProduct.value; // 更新商品批號欄位
    }
    closeProductModal();
}

// 總金額運算
// 監聽金額和數量的輸入變化
// 監聽收入表單的金額和數量的變動
document.getElementById('income-amount').addEventListener('input', IncomecalculateTotal);
document.getElementById('income-quantity').addEventListener('input', IncomecalculateTotal);

function IncomecalculateTotal() {
    const amount = parseFloat(document.getElementById('income-amount').value) || 0; // 確保為數字
    const quantity = parseFloat(document.getElementById('income-quantity').value) || 0; // 確保為數字
    const total = Math.floor(amount * quantity); // 計算總金額，取整數
    document.getElementById('total-income').value = `$${total}`; // 更新總金額欄位，加上$
}


document.getElementById('amount').addEventListener('input', calculateTotal);
document.getElementById('quantity').addEventListener('input', calculateTotal);

function calculateTotal() {
    const amount = parseFloat(document.getElementById('amount').value) || 0; // 確保為數字
    const quantity = parseFloat(document.getElementById('quantity').value) || 0; // 確保為數字
    const total = Math.floor(amount * quantity); // 計算總金額，取整數
    document.getElementById('total-amount').value = `$${total}`; // 更新總金額欄位，加上$
}
        // JavaScript函數用於獲取當前日期
        function displayCurrentDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份從0開始
            const day = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            document.getElementById('current-date').textContent = formattedDate;
        }
        
        // 當頁面加載完成時顯示當前日期
        window.onload = displayCurrentDate;

        function openIncomeModal() {
            document.getElementById('incomeModal').style.display = 'block';
        }
        function closeIncomeModal() {
            document.getElementById('incomeModal').style.display = 'none';
        }
        function closeIncomeSecondaryModal() {
            document.getElementById('IncomesecondaryModal').style.display = 'none';
        }
        function confirmIncomeSelection() {
            const selectedOption = document.querySelector('#incomeModal input[name="income"]:checked');
            
            if (selectedOption) {
                primarySelection = selectedOption.value; // 儲存第一個選擇的值
                closeIncomeModal(); // 關閉收入模態
                openIncomeSecondaryModal(); // 開啟次要選擇模態
            } else {
                // 如果沒有選擇，顯示提示或處理未選擇的情況
                alert("請選擇一個收入類別"); // 你可以根據需要更改這個提示
            }
        }
        function openIncomeSecondaryModal() {
            document.getElementById('IncomesecondaryModal').style.display = 'block';
        }
        
        // 確認二次選擇並更新費用類別欄位
function confirmIncomeSecondarySelection() {
    const selectedOption = document.querySelector('#IncomesecondaryModal input[name="Incomesecondary-option"]:checked');
    if (selectedOption) {
        secondarySelection = selectedOption.value; // 儲存第二個選擇的值
    } else {
        secondarySelection = '未選擇';
    }

    // 將兩個選項顯示在費用類別欄位
    document.getElementById('income-category').value = `${primarySelection} / ${secondarySelection}`;

    closeIncomeSecondaryModal(); // 關閉第二個視窗
}
