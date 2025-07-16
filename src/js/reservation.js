// reservation.js - 予約関連の処理

// 予約履歴の読み込み
async function loadReservationHistory() {
    if (!supabase || !currentUser) return;
    
    try {
        // 予約データを取得
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('reservation_date', { ascending: false });
        
        if (error) throw error;
        
        displayReservationHistory(data);
        
    } catch (error) {
        console.error('予約履歴の取得エラー:', error);
        document.getElementById('reservationList').innerHTML = 
            '<p>予約履歴の読み込みに失敗しました</p>';
    }
}

// 予約履歴の表示
function displayReservationHistory(reservations) {
    const listContainer = document.getElementById('reservationList');
    
    if (!reservations || reservations.length === 0) {
        listContainer.innerHTML = '<p>予約履歴がありません</p>';
        return;
    }
    
    const html = reservations.map(reservation => {
        const statusClass = reservation.status === 'confirmed' ? 'confirmed' : 'cancelled';
        const statusText = reservation.status === 'confirmed' ? '予約確定' : 'キャンセル済み';
        
        return `
            <div class="reservation-item">
                <div class="reservation-header">
                    <h4>${reservation.plan_name}</h4>
                    <span class="status ${statusClass}">${statusText}</span>
                </div>
                <div class="reservation-details">
                    <p>📅 ${formatDate(reservation.reservation_date)}</p>
                    <p>🕐 ${reservation.start_time}</p>
                    <p>👥 ${reservation.guest_count}名 / 🐕 ${reservation.pet_count}頭</p>
                    <p>💰 ${reservation.plan_price}</p>
                </div>
                ${reservation.status === 'confirmed' && isFutureReservation(reservation.reservation_date) ? `
                    <div class="reservation-actions">
                        <button class="btn-secondary" onclick="cancelReservation('${reservation.id}')">
                            予約をキャンセル
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    listContainer.innerHTML = html;
}

// 予約キャンセル処理
async function cancelReservation(reservationId) {
    if (!confirm('予約をキャンセルしますか？')) return;
    
    try {
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('id', reservationId);
        
        if (error) throw error;
        
        alert('予約をキャンセルしました');
        loadReservationHistory(); // リストを再読み込み
        
    } catch (error) {
        console.error('キャンセルエラー:', error);
        alert('キャンセルに失敗しました');
    }
}

// 空き状況チェック（実装例）
async function checkAvailability(date, time) {
    try {
        // 該当日時の予約数を取得
        const { data, error } = await supabase
            .from('reservations')
            .select('id')
            .eq('reservation_date', date)
            .eq('start_time', time)
            .eq('status', 'confirmed');
        
        if (error) throw error;
        
        // 最大予約数（仮に4組まで）
        const maxCapacity = 4;
        const currentBookings = data.length;
        
        return {
            available: currentBookings < maxCapacity,
            remainingSlots: maxCapacity - currentBookings
        };
        
    } catch (error) {
        console.error('空き状況チェックエラー:', error);
        return { available: true, remainingSlots: 0 };
    }
}

// 予約可能な時間スロットの更新（空き状況を考慮）
async function updateAvailableTimesWithCapacity() {
    const dateInput = document.getElementById('reservationDate');
    const timeSelect = document.getElementById('reservationTime');
    
    if (!dateInput || !timeSelect || !supabase) {
        updateAvailableTimes(); // Supabaseが使えない場合は通常の更新
        return;
    }
    
    const selectedDate = dateInput.value;
    const dayOfWeek = new Date(selectedDate).getDay();
    
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
    
    // 各時間スロットの空き状況をチェック
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // 空き状況をチェック
            const availability = await checkAvailability(selectedDate, timeString);
            
            if (availability.available) {
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = `${timeString} (残り${availability.remainingSlots}枠)`;
                timeSelect.appendChild(option);
            }
        }
    }
}

// 日付フォーマット関数
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    
    return `${year}年${month}月${day}日(${weekDay})`;
}

// 将来の予約かチェック
function isFutureReservation(dateString) {
    const reservationDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return reservationDate >= today;
}

// リアルタイム更新の設定（オプション）
function setupRealtimeUpdates() {
    if (!supabase) return;
    
    // 予約テーブルの変更を監視
    supabase
        .channel('reservations-changes')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'reservations' 
            }, 
            (payload) => {
                console.log('予約データが更新されました:', payload);
                // 必要に応じて画面を更新
                if (document.getElementById('myPageSection').classList.contains('active')) {
                    loadReservationHistory();
                }
            }
        )
        .subscribe();
}