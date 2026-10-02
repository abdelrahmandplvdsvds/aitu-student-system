// =====================================================
// AITU STUDENTS MANAGEMENT SYSTEM
// LOGIN
// =====================================================


// ================= API =================

const API_URL =
    "https://script.google.com/macros/s/AKfycbw4qncrOKZhNkNVJ-5ms4GtzX5cwMezEa0Tin4hhxv_5esIx8wbmtTVH9dzQQsHBShG/exec";


// ================= ELEMENTS =================

const loginForm =
    document.getElementById("loginForm");

const adminPassword =
    document.getElementById("adminPassword");

const loginError =
    document.getElementById("loginError");

const loginButton =
    document.getElementById("loginButton");

const togglePassword =
    document.getElementById("togglePassword");


// ================= PASSWORD TOGGLE =================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const isPassword =
                adminPassword.type === "password";

            adminPassword.type =
                isPassword
                    ? "text"
                    : "password";

            togglePassword.innerHTML =
                isPassword
                    ? "<i class='fa-solid fa-eye-slash'></i>"
                    : "<i class='fa-solid fa-eye'></i>";

        }
    );

}


// ================= LOGIN =================

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const password =
            adminPassword.value.trim();

        if (!password) {

            loginError.textContent =
                "من فضلك أدخل كلمة المرور";

            return;
        }

        loginError.textContent = "";

        loginButton.disabled = true;

        loginButton.innerHTML =
            `
                <span>
                    جاري تسجيل الدخول...
                </span>
            `;

        try {

            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({
                        action: "login",
                        password: password
                    })

                });


            if (!response.ok) {

                throw new Error(
                    "API request failed"
                );

            }


            const result =
                await response.json();


            if (
                !result ||
                !result.success
            ) {

                loginError.textContent =
                    result?.message ||
                    "كلمة المرور غير صحيحة";

                return;
            }


            // ================= SAVE TOKEN =================

            sessionStorage.setItem(
                "authToken",
                result.token
            );


            // ================= GO TO DASHBOARD =================

            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            loginError.textContent =
                "حدث خطأ أثناء الاتصال بالسيرفر";


        } finally {

            loginButton.disabled = false;

            loginButton.innerHTML =
                `
                    <span>
                        تسجيل الدخول
                    </span>

                    <span>
                        ←
                    </span>
                `;

        }

    }
);