// auth.js - 認証関連の処理

// ログインフォームの処理
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        updateUIForLoggedInUser();
        closeLoginModal();
        
        alert('ログインしました');
        
    } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました: ' + error.message);
    }
});

// 新規登録フォーム表示
function showSignupForm() {
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="signupForm">
            <div class="form-group">
                <label for="signupEmail">メールアドレス</label>
                <input type="email" id="signupEmail" required>
            </div>
            <div class="form-group">
                <label for="signupPassword">パスワード</label>
                <input type="password" id="signupPassword" required minlength="6">
            </div>
            <div class="form-group">
                <label for="signupPasswordConfirm">パスワード（確認）</label>
                <input type="password" id="signupPasswordConfirm" required minlength="6">
            </div>
            <button type="submit" class="btn-primary full-width">新規登録</button>
        </form>
        <p class="text-center mt-2">
            既にアカウントをお持ちの方は
            <a href="#" onclick="showLoginForm()">ログイン</a>
        </p>
    `;
    
    // 新規登録フォームのイベントリスナー
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

// ログインフォーム表示
function showLoginForm() {
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="loginForm">
            <div class="form-group">
                <label for="email">メールアドレス</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">パスワード</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit" class="btn-primary full-width">ログイン</button>
        </form>
        <p class="text-center mt-2">
            アカウントをお持ちでない方は
            <a href="#" onclick="showSignupForm()">新規登録</a>
        </p>
    `;
    
    // ログインフォームのイベントリスナー
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// 新規登録処理
async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        alert('パスワードが一致しません');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        alert('登録確認メールを送信しました。メールを確認してください。');
        showLoginForm();
        
    } catch (error) {
        console.error('登録エラー:', error);
        alert('登録に失敗しました: ' + error.message);
    }
}

// ログイン処理（関数化）
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        updateUIForLoggedInUser();
        closeLoginModal();
        
        alert('ログインしました');
        
    } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました: ' + error.message);
    }
}

// ログアウト処理
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        updateUIForLoggedOutUser();
        showHome();
        
        alert('ログアウトしました');
        
    } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウトに失敗しました');
    }
}

// 認証状態の監視
if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            updateUIForLoggedInUser();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
}