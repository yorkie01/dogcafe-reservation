// グローバル変数
let currentUser = null;
let selectedPlan = null;
let supabase = null;

// Supabase初期化
async function initSupabase() {
    if (window.SUPABASE_URL === '%%SUPABASE_URL%%') {
        console.error('Supabase環境変数が設定されていません');
        return;
    }
    
    // Supabase CDNから読み込み
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);
    
    script.onload = () => {
        supabase = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY
        );
        
        // 認証状態を確認
        checkAuthState();
    };
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    // Supabase初期化
    initSupabase();
    
    // ローディング画面を非表示
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 日付入力の最小値を今日に設定
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('reservationDate');
    if (dateInput) {
        dateInput.min = today;
        dateInput.value = today;
    }
});

// イベントリスナーの設定
function setupEventListeners() {
    // プランカードのクリックイベント
    document.querySelectorAll('.plan-card button').forEach(button => {
        button.addEventListener('click', (e) => {
            const planCard = e.target.closest('.plan-card');
            const planType = planCard.dataset.plan;
            const planName = planCard.querySelector('h3').textContent;
            const planPrice = planCard.querySelector('.price').textContent;
            
            selectedPlan = {
                type: planType,
                name: planName,
                price: planPrice
            };
            
            showReservationForm();
        });
    });
    
    // 予約フォームの送信
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
    
    // 日付変更時に利用可能な時間を更新
    const dateInput = document.getElementById('reservationDate');
    if (dateInput) {
        dateInput.addEventListener('change', updateAvailableTimes);
    }
    
    // ログインボタン
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }
    
    // ユーザーメニューボタン
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', showMyPage);
    }
}

// 画面遷移関数
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

function showHome() {
    showSection('homeSection');
}

function showReservationForm() {
    if (!currentUser) {
        alert('予約には会員登録が必要です。');
        showLoginModal();
        return;
    }
    
    // 選択したプランを表示
    document.getElementById('selectedPlan').textContent = 
        `${selectedPlan.name} - ${selectedPlan.price}`;
    
    // 利用可能な時間を更新
    updateAvailableTimes();
    
    showSection('reservationSection');
}

function showConfirmation() {
    showSection('confirmSection');
}

function showComplete() {
    showSection('completeSection');
}

function showMyPage() {
    showSection('myPageSection');
    loadReservationHistory();
}

// 予約フォームの処理
function handleReservationSubmit(e) {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('reservationDate').value,
        time: document.getElementById('reservationTime').value,
        guestCount: document.getElementById('guestCount').value,
        petCount: document.getElementById('petCount').value,
        notes: document.getElementById('notes').value
    };
    
    // 確認画面に表示
    const confirmHTML = `
        <div class="detail-row">
            <span>プラン</span>
            <span>${selectedPlan.name}</span>
        </div>
        <div class="detail-row">
            <span>料金</span>
            <span>${selectedPlan.price}</span>
        </div>
        <div class="detail-row">
            <span>予約日</span>
            <span>${formData.date}</span>
        </div>
        <div class="detail-row">
            <span>予約時間</span>
            <span>${formData.time}</span>
        </div>
        <div class="detail-row">
            <span>利用人数</span>
            <span>${formData.guestCount}名</span>
        </div>
        <div class="detail-row">
            <span>ワンちゃんの頭数</span>
            <span>${formData.petCount}頭</span>
        </div>
        ${formData.notes ? `
        <div class="detail-row">
            <span>備考</span>
            <span>${formData.notes}</span>
        </div>
        ` : ''}
    `;
    
    document.getElementById('confirmDetails').innerHTML = confirmHTML;
    
    // 確認画面データを保存
    window.reservationData = formData;
    
    showConfirmation();
}

// 予約確定処理
async function submitReservation() {
    if (!supabase || !currentUser) {
        alert('ログインが必要です');
        return;
    }
    
    try {
        // ローディング表示
        document.getElementById('loading').style.display = 'flex';
        
        // 予約データの作成
        const reservationData = {
            user_id: currentUser.id,
            plan_type: selectedPlan.type,
            plan_name: selectedPlan.name,
            plan_price: selectedPlan.price,
            reservation_date: window.reservationData.date,
            start_time: window.reservationData.time,
            guest_count: parseInt(window.reservationData.guestCount),
            pet_count: parseInt(window.reservationData.petCount),
            notes: window.reservationData.notes,
            status: 'confirmed'
        };
        
        // Supabaseに保存（実際の実装時）
        // const { data, error } = await supabase
        //     .from('reservations')
        //     .insert([reservationData]);
        
        // 仮の予約ID（実際はデータベースから取得）
        const reservationId = 'RSV' + Date.now();
        
        // QRコード生成（実際の実装時はライブラリを使用）
        document.getElementById('reservationQR').innerHTML = 
            `<div style="padding: 20px; border: 2px solid #333;">
                予約ID: ${reservationId}
            </div>`;
        
        // ローディング非表示
        document.getElementById('loading').style.display = 'none';
        
        // 完了画面表示
        showComplete();
        
    } catch (error) {
        console.error('予約エラー:', error);
        alert('予約の処理中にエラーが発生しました');
        document.getElementById('loading').style.display = 'none';
    }
}

// 利用可能な時間を更新
function updateAvailableTimes() {
    const dateInput = document.getElementById('reservationDate');
    const timeSelect = document.getElementById('reservationTime');
    
    if (!dateInput || !timeSelect) return;
    
    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay();
    
    // 曜日に応じた営業時間
    let startHour, endHour;
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 土日
        startHour = 9;
        endHour = 21;
    } else { // 平日
        startHour = 10;
        endHour = 20;
    }
    
    // 時間オプションをクリア
    timeSelect.innerHTML = '<option value="">時間を選択してください</option>';
    
    // 30分刻みで時間を追加
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = timeString;
            timeSelect.appendChild(option);
        }
    }
}

// 予約画面に戻る
function backToReservation() {
    showSection('reservationSection');
}

// モーダル関連
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// 認証状態の確認
async function checkAuthState() {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        currentUser = user;
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

// ログイン済みユーザー用のUI更新
function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userMenuBtn').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUser.email;
}

// ログアウト済みユーザー用のUI更新
function updateUIForLoggedOutUser() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('userMenuBtn').style.display = 'none';
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}