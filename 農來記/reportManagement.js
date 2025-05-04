window.onload = function() {
    // 默认显示 page1
    switchPage('page1', document.querySelector('.sub-header span'));
}

function switchPage(page, element) {
    // 移除所有 span 的 active 类别
    const spans = document.querySelectorAll('.sub-header span');
    spans.forEach(span => span.classList.remove('active'));
    
    // 为当前点击的按钮添加 active 类别
    element.classList.add('active');
    
    // 根据不同的页面代号显示不同的内容
    const content = document.getElementById('pageContent');
    
    // 清除现有内容
    content.innerHTML = ''; 

    // 根据选中的页面更新内容
    switch (page) {
        case 'page1':
            content.innerHTML = `
                <div class="pie-chart" style="margin-top:60px">
                    <div class="inner-circle"></div>
                </div>
                <hr style="margin-top:60px;">
                <div class="profit">1,099,172</div>
            `;
            break;
        case 'page2':
            content.innerHTML = `
                 <div class="financial-summary">
                    <div class="summary-box">
                        <p style="color: red;">支出</p>
                        <p style="color: red;">0</p> <!-- 這裡可以替換為實際數字 -->
                    </div>
                    <div class="summary-box">
                        <p style="color: green;">收入</p>
                        <p style="color: green;">0</p> <!-- 這裡可以替換為實際數字 -->
                    </div>
                    <div class="summary-box">
                        <p>損益</p>
                        <p>0</p> <!-- 這裡可以替換為實際數字 -->
                    </div>
                </div>
                <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>科目/帳本</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>種苗費</td></tr>
                        <tr><td>肥料費</td></tr>
                        <tr><td>農藥費</td></tr>
                        <tr><td>能源費</td></tr>
                        <tr><td>材料費</td></tr>
                        <tr><td>工資費</td></tr>
                        <tr><td>地租</td></tr>
                        <tr><td>維修費</td></tr>
                        <tr><td>其他</td></tr>
                        <tr><td>購水費</td></tr>
                        <tr class="total-row"><td>總計</td></tr>
                    </tbody>
                </table>
            `;
            break;
        // case 'page3':
        //     content.innerHTML = `
        //         <div class="item income">耕地別收支統計內容</div>
        //         <div class="pie-chart">
        //             <div class="inner-circle"></div>
        //             <div class="percentage">耕地統計圖表</div>
        //         </div>
        //         <hr>
        //         <div class="profit">1,099,172</div>
        //     `;
        //     break;
        case 'page4':
            content.innerHTML = `
                            <div class="main-content">
           

                <div class="section-header" onclick="toggleSection('incomeContent', 'incomeTriangle')">
                    <strong>收入項目</strong>
                    <span id="incomeTriangle" class="triangle">▶</span>
                </div>
                <div id="incomeContent" class="content">
                    <div class="item"><span>作物銷售</span><span>1,100,000</span></div>
                    <div class="item"><span>副產品銷售</span><span>0</span></div>
                    <div class="item"><span>其他</span><span>160</span></div>
                    <div class="item"><span>哈哈</span><span>0</span></div>
                    <div class="item" style="font-weight: bold; color: green; background-color: transparent; box-shadow: none;">
                        <span>收入合計</span><span>1,100,160</span>
                    </div>
                </div>

                <div class="expenditure-header" onclick="toggleSection('expenseContent', 'expenseTriangle')">
                    <strong>支出項目</strong>
                    <span id="expenseTriangle" class="triangle">▶</span>
                </div>
                <div id="expenseContent" class="content">
                    <div class="item"><span>種苗費</span><span>0</span></div>
                    <div class="item"><span>肥料費</span><span>988</span></div>
                    <div class="item"><span>農藥費</span><span>0</span></div>
                    <div class="item"><span>能源費</span><span>0</span></div>
                    <div class="item"><span>材料費</span><span>0</span></div>
                    <div class="item"><span>工資費</span><span>0</span></div>
                    <div class="item"><span>地租</span><span>0</span></div>
                    <div class="item"><span>維修費</span><span>0</span></div>
                    <div class="item"><span>其他</span><span>0</span></div>
                    <div class="item"><span>購水費</span><span>0</span></div>
                    <div class="item"><span>農機具</span><span>0</span></div>
                    <div class="item"><span>設施</span><span>0</span></div>
                </div>

                <div class="profit">損益 1,099,172</div>
            </div>
            `;
            break;
            case 'page5':
            content.innerHTML = `
                       <div class="container">
                            <div class="item">
                                <div class="item-number">1</div>
                                <div class="item-name">
                                    <img src="img/gold-medal.png" alt="王冠" class="item-icon"> <!-- 用於顯示王冠圖片 -->
                                    <span>高麗菜</span>
                                </div>
                                <div class="item-value">1,000,160</div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress">100%</div>
                            </div>
                            <div class="total">
                                <span>總計</span>
                                <span class="total-value">1,000,160</span>
                            </div>
                        </div>
            `;
            break;
        default:
            content.innerHTML = ''; // 默认情况下清空内容
    }
}

function openModal() {
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

function applyFilters() {
    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;

    // 处理筛选逻辑，例如根据用户输入更新内容
    alert(`已应用条件：日期 - ${date}, 金额 - ${amount}`);
    closeModal(); // 关闭模态窗口
}

// 点击模态窗口外部关闭窗口
window.onclick = function(event) {
    const modal = document.getElementById("myModal");
    if (event.target === modal) {
        closeModal();
    }
}

function setActiveStatus(element) {
    // 移除所有按钮的 active 类别
    const buttons = document.querySelectorAll('.status-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // 为当前点击的按钮添加 active 类别
    element.classList.add('active');
}

function setActiveAmount(element) {
    // 移除所有金额按钮的 active 类别
    const amountButtons = document.querySelectorAll('.amountBut');
    amountButtons.forEach(button => button.classList.remove('active'));
    
    // 为当前点击的金额按钮添加 active 类别
    element.classList.add('active');
}
function toggleSection(contentId, triangleId) {
    const content = document.getElementById(contentId);
    const triangle = document.getElementById(triangleId);
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        triangle.classList.add("rotated"); // 旋轉三角形
    } else {
        content.style.display = "none";
        triangle.classList.remove("rotated"); // 重置三角形方向
    }
}