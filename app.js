// =====================================================
// AITU STUDENTS MANAGEMENT SYSTEM
// Google Sheets API + Admin Authentication
// =====================================================


// ================= API =================

const API_URL =
    "https://script.google.com/macros/s/AKfycbw4qncrOKZhNkNVJ-5ms4GtzX5cwMezEa0Tin4hhxv_5esIx8wbmtTVH9dzQQsHBShG/exec";

let authToken =
    sessionStorage.getItem("authToken");


// لو مفيش Login
if (!authToken) {
    window.location.href = "login.html";
}


// ================= DATA =================

let students = [];
let sections = [];
let departments = [];
let specializations = [];
let editingStudentId = null;


// ================= ELEMENTS =================

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const studentsTableBody =
    document.getElementById("studentsTableBody");

const studentsEmpty =
    document.getElementById("studentsEmpty");

const studentsCount =
    document.getElementById("studentsCount");

const studentSearch =
    document.getElementById("studentSearch");

const sectionFilter =
    document.getElementById("sectionFilter");

const departmentFilter =
    document.getElementById("departmentFilter");

const specializationFilter =
    document.getElementById("specializationFilter");

const studentForm =
    document.getElementById("studentForm");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalTitle =
    document.getElementById("modalTitle");

const modalSubtitle =
    document.getElementById("modalSubtitle");

const modalClose =
    document.getElementById("modalClose");

const cancelStudent =
    document.getElementById("cancelStudent");

const studentId =
    document.getElementById("studentId");

const studentName =
    document.getElementById("studentName");

const studentDepartment =
    document.getElementById("studentDepartment");

const studentSpecialization =
    document.getElementById("studentSpecialization");

const studentSection =
    document.getElementById("studentSection");

const sectionsGrid =
    document.getElementById("sectionsGrid");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const loginScreen =
    document.getElementById("loginScreen");

const loginForm =
    document.getElementById("loginForm");

const adminPassword =
    document.getElementById("adminPassword");

const loginError =
    document.getElementById("loginError");

const appContainer =
    document.getElementById("appContainer");

// ================= SECTION STUDENTS MODAL =================

const sectionStudentsOverlay =
    document.getElementById("sectionStudentsOverlay");

const sectionStudentsClose =
    document.getElementById("sectionStudentsClose");

const closeSectionStudents =
    document.getElementById("closeSectionStudents");

const sectionStudentsTitle =
    document.getElementById("sectionStudentsTitle");

const sectionStudentsSubtitle =
    document.getElementById("sectionStudentsSubtitle");

const sectionStudentsCount =
    document.getElementById("sectionStudentsCount");

const sectionStudentsBody =
    document.getElementById("sectionStudentsBody");

const sectionStudentsEmpty =
    document.getElementById("sectionStudentsEmpty");
// ================= INITIALIZE =================

document.addEventListener("DOMContentLoaded", async () => {

    setupNavigation();
    setupEvents();
    setupLogin();

    // لو فيه Token محفوظ
    if (authToken) {

        showApp();

        try {

            await loadAllData();

        } catch (error) {

            console.error(error);

            logout(false);

        }

    } else {

        showLogin();

    }

});


// ================= AUTH UI =================

function setupLogin() {

    if (!loginForm) {
        console.error("Login form not found");
        return;
    }

    loginForm.addEventListener("submit", handleLogin);

}


function showLogin() {

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (appContainer) {
        appContainer.style.display = "none";
    }

}


function showLogin() {
    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (appContainer) {
        appContainer.classList.remove("active");
    }
}

function showApp() {
    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (appContainer) {
        appContainer.classList.add("active");
    }
}

async function handleLogin(event) {

    event.preventDefault();

    const password =
        adminPassword.value.trim();

    if (!password) {

        loginError.textContent =
            "من فضلك أدخل كلمة المرور";

        return;

    }

    loginError.textContent = "";

    const button =
        loginForm.querySelector("button");

    if (button) {
        button.disabled = true;
        button.textContent = "جاري تسجيل الدخول...";
    }

    try {

        const result = await apiPostPublic({
            action: "login",
            password: password
        });


        if (!result.success) {

            loginError.textContent =
                result.message ||
                "كلمة المرور غير صحيحة";

            return;

        }


        // حفظ Token
        authToken = result.token;

        sessionStorage.setItem(
            "authToken",
            authToken
        );


        adminPassword.value = "";

        showApp();

        await loadAllData();

        showToast(
            "تم تسجيل الدخول بنجاح"
        );

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "حدث خطأ أثناء تسجيل الدخول";

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "تسجيل الدخول";

        }

    }

}


// ================= LOGOUT =================
async function logout(callServer = true) {

    const oldToken = authToken;

    authToken = null;

    sessionStorage.removeItem(
        "authToken"
    );

    if (callServer && oldToken) {

        try {

            await apiPostPublic({
                action: "logout",
                token: oldToken
            });

        } catch (error) {

            console.error(error);

        }

    }

    window.location.href =
        "login.html";
}

// ================= NAVIGATION =================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item, .mobile-nav-item"
        );

    const pages =
        document.querySelectorAll(
            ".page[data-page-content]"
        );

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;

                if (!page) {
                    return;
                }

                showPage(page);

                // Close mobile menu
                const mobileNavigation =
                    document.getElementById(
                        "mobileNavigation"
                    );

                if (mobileNavigation) {

                    mobileNavigation.classList.remove(
                        "active"
                    );

                }

                // Update all navigation items
                navItems.forEach(nav => {

                    nav.classList.toggle(
                        "active",
                        nav.dataset.page === page
                    );

                });

            }
        );

    });

}


function showPage(page) {

    const pages = document.querySelectorAll(
        ".page[data-page-content]"
    );

    const navItems = document.querySelectorAll(
        ".nav-item, .mobile-nav-item"
    );

    pages.forEach(p => {
        p.classList.toggle(
            "active",
            p.dataset.pageContent === page
        );
    });

    navItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === page
        );
    });

    const titles = {

        dashboard: [
            "الرئيسية",
            "نظرة عامة على بيانات الطلاب"
        ],

        students: [
            "الطلاب",
            "إدارة والبحث في بيانات الطلاب"
        ],

        sections: [
            "السكاشن",
            "إدارة السكاشن وعرض الطلاب داخل كل Section"
        ],

        statistics: [
            "الإحصائيات",
            "نظرة عامة على بيانات الطلاب"
        ]

    };

    if (titles[page]) {

        pageTitle.textContent =
            titles[page][0];

        pageSubtitle.textContent =
            titles[page][1];
    }

    const mobileNavigation =
        document.getElementById(
            "mobileNavigation"
        );

    if (mobileNavigation) {
        mobileNavigation.classList.remove("active");
    }
}

// ================= EVENTS =================

function setupEvents() {

    const printAllStudentsButton =
    document.getElementById("printAllStudentsButton");

if (printAllStudentsButton) {
    printAllStudentsButton.addEventListener(
        "click",
        printAllStudents
    );
}
    // ================= MOBILE MENU =================

    const mobileNavigation =
        document.getElementById(
            "mobileNavigation"
        );

    if (menuButton && mobileNavigation) {

        menuButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                mobileNavigation.classList.toggle(
                    "active"
                );

            }
        );

        document.addEventListener(
            "click",
            event => {

                if (
                    mobileNavigation.classList.contains("active") &&
                    !mobileNavigation.contains(event.target) &&
                    !menuButton.contains(event.target)
                ) {

                    mobileNavigation.classList.remove(
                        "active"
                    );

                }

            }
        );
    }


    // ================= LOGOUT =================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => logout()
        );

    }


    // ================= REFRESH =================

    const refreshDataButton =
        document.getElementById(
            "refreshDataButton"
        );

    if (refreshDataButton) {

        refreshDataButton.addEventListener(
            "click",
            async () => {

                if (!authToken) {
                    showLogin();
                    return;
                }

                try {

                    await loadAllData();

                    showToast(
                        "تم تحديث البيانات بنجاح"
                    );

                } catch (error) {

                    console.error(error);

                    if (
                        error.message !==
                        "Unauthorized"
                    ) {

                        showToast(
                            "حدث خطأ أثناء تحديث البيانات",
                            "error"
                        );

                    }

                }

            }
        );

    }


    // ================= PASSWORD TOGGLE =================

    const togglePassword =
        document.getElementById(
            "togglePassword"
        );

    if (togglePassword && adminPassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                const isPassword =
                    adminPassword.type ===
                    "password";

                adminPassword.type =
                    isPassword
                        ? "text"
                        : "password";

                togglePassword.textContent =
                    isPassword
                        ? "🙈"
                        : "👁";

            }
        );

    }


    // ================= ADD STUDENT =================

    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );

    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            () => openStudentModal()
        );

    }


    // ================= QUICK ADD =================

    const quickAddStudent =
        document.getElementById(
            "quickAddStudent"
        );

    if (quickAddStudent) {

        quickAddStudent.addEventListener(
            "click",
            () => {

                showPage("students");

                openStudentModal();

            }
        );

    }


    // ================= QUICK VIEW STUDENTS =================

    const quickViewStudents =
        document.getElementById(
            "quickViewStudents"
        );

    if (quickViewStudents) {

        quickViewStudents.addEventListener(
            "click",
            () => showPage("students")
        );

    }


    // ================= QUICK VIEW SECTIONS =================

    const quickViewSections =
        document.getElementById(
            "quickViewSections"
        );

    if (quickViewSections) {

        quickViewSections.addEventListener(
            "click",
            () => showPage("sections")
        );

    }


    // ================= ADD SECTION =================

    const addSectionButton =
        document.getElementById(
            "addSectionButton"
        );

    if (addSectionButton) {

        addSectionButton.addEventListener(
            "click",
            addNewSection
        );

    }


    // ================= STUDENT MODAL =================

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeStudentModal
        );

    }

    if (cancelStudent) {

        cancelStudent.addEventListener(
            "click",
            closeStudentModal
        );

    }

    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modalOverlay
                ) {

                    closeStudentModal();

                }

            }
        );

    }


    // ================= STUDENT FORM =================

    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            handleStudentSubmit
        );

    }


    // ================= SEARCH =================

    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            renderStudents
        );

    }


    // ================= FILTERS =================

    if (sectionFilter) {

        sectionFilter.addEventListener(
            "change",
            renderStudents
        );

    }

    if (departmentFilter) {

        departmentFilter.addEventListener(
            "change",
            renderStudents
        );

    }

    if (specializationFilter) {

        specializationFilter.addEventListener(
            "change",
            renderStudents
        );

    }


    // ================= SECTION STUDENTS MODAL =================

    if (sectionStudentsClose) {

        sectionStudentsClose.addEventListener(
            "click",
            closeSectionStudentsModal
        );

    }

    if (closeSectionStudents) {

        closeSectionStudents.addEventListener(
            "click",
            closeSectionStudentsModal
        );

    }

    if (sectionStudentsOverlay) {

        sectionStudentsOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    sectionStudentsOverlay
                ) {

                    closeSectionStudentsModal();

                }

            }
        );

    }

}




// ================= LOAD DATA =================

async function loadAllData() {

    try {

        showToast(
            "جاري تحميل البيانات..."
        );

        await Promise.all([
    loadStudents(),
    loadSections(),
    loadDepartments(),
    loadSpecializations()
]);

// مهم جدًا: تعبئة الـ Selects بعد تحميل البيانات
populateFilters();

updateDashboard();
renderStudents();
renderSections();
renderStatistics();

        showToast(
            "تم تحميل البيانات بنجاح"
        );

    } catch (error) {

        console.error(error);

        throw error;

    }

}


// ================= GET API =================

// ================= GET API =================

// ================= GET API =================

async function apiGet(action, params = {}) {

    if (!authToken) {

        showLogin();

        throw new Error(
            "Authentication required"
        );

    }


    const url =
        new URL(API_URL);


    url.searchParams.set(
        "action",
        action
    );


    // إرسال Token مع كل GET request
    url.searchParams.set(
        "token",
        authToken
    );


    Object.entries(params).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                url.searchParams.set(
                    key,
                    value
                );

            }

        }
    );


    const response =
        await fetch(
            url.toString()
        );


    if (!response.ok) {

        throw new Error(
            "API request failed"
        );

    }


    const result =
        await response.json();


    // =========================
    // TOKEN INVALID / EXPIRED
    // =========================

    if (
        result &&
        result.success === false &&
        result.message === "Unauthorized"
    ) {

        authToken = null;

        sessionStorage.removeItem(
            "authToken"
        );


        showLogin();


        if (loginError) {

            loginError.textContent =
                "انتهت جلسة الدخول، سجل الدخول مرة أخرى";

        }


        throw new Error(
            "Unauthorized"
        );

    }


    return result;

}
// ================= PUBLIC POST =================

async function apiPostPublic(data) {

    const response =
        await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body:
                JSON.stringify(data)

        });


    if (!response.ok) {

        throw new Error(
            "API request failed"
        );

    }


    return await response.json();

}


// ================= PROTECTED POST =================

async function apiPost(data) {

    if (!authToken) {

        showLogin();

        throw new Error(
            "Authentication required"
        );

    }


    const requestData = {

        ...data,

        token: authToken

    };


    const result =
        await apiPostPublic(
            requestData
        );


    // Token expired / invalid
    if (
        result &&
        result.success === false &&
        result.message === "Unauthorized"
    ) {

        authToken = null;

        sessionStorage.removeItem(
            "authToken"
        );

        showLogin();

        if (loginError) {

            loginError.textContent =
                "انتهت جلسة الدخول، سجل الدخول مرة أخرى";

        }

        throw new Error(
            "Unauthorized"
        );

    }


    return result;

}


// ================= LOAD STUDENTS =================

async function loadStudents() {

    const result =
        await apiGet("students");


    if (!result.success) {

        throw new Error(
            result.message
        );

    }


    students =
        result.students || [];

}


// ================= LOAD SECTIONS =================

async function loadSections() {

    const result =
        await apiGet("sections");


    if (!result.success) {

        throw new Error(
            result.message
        );

    }


    sections =
        result.sections || [];

}


// ================= LOAD DEPARTMENTS =================

async function loadDepartments() {

    const result =
        await apiGet("departments");


    if (!result.success) {

        throw new Error(
            result.message
        );

    }


    departments =
        result.departments || [];

}


// ================= LOAD SPECIALIZATIONS =================

async function loadSpecializations() {

    const result =
        await apiGet(
            "specializations"
        );


    if (!result.success) {

        throw new Error(
            result.message
        );

    }


    specializations =
        result.specializations || [];

}


// ================= DASHBOARD =================

function updateDashboard() {

    document.getElementById(
        "totalStudents"
    ).textContent =
        students.length;


    document.getElementById(
        "totalSections"
    ).textContent =
        sections.length;


    const withoutSection =
        students.filter(
            student =>
                !student.Section ||
                String(student.Section)
                    .trim() === ""
        ).length;


    document.getElementById(
        "studentsWithoutSection"
    ).textContent =
        withoutSection;


    document.getElementById(
        "totalSpecializations"
    ).textContent =
        specializations.length;

}


// ================= FILTERS =================

function populateFilters() {

    // ================= SECTION FILTER =================

    sectionFilter.innerHTML = `
        <option value="">كل السكاشن</option>
    `;

    sections.forEach(section => {

        const value = String(
            section.Section_Name ?? ""
        ).trim();

        if (!value) return;

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        sectionFilter.appendChild(option);
    });


    // ================= DEPARTMENT FILTER =================

    // فلتر الأقسام في صفحة الطلاب
departmentFilter.innerHTML = `
    <option value="">كل الأقسام</option>
`;

departments.forEach(department => {

    const value = String(
        department.Department_Name ?? ""
    ).trim();

    if (!value) return;

    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    departmentFilter.appendChild(option);
});


// قسم الطالب داخل نافذة الإضافة/التعديل
studentDepartment.innerHTML = `
    <option value="">اختر القسم</option>
`;

departments.forEach(department => {

    const value = String(
        department.Department_Name ?? ""
    ).trim();

    if (!value) return;

    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    studentDepartment.appendChild(option);
});

    // ================= SPECIALIZATION FILTER =================

    specializationFilter.innerHTML = `
        <option value="">كل التخصصات</option>
    `;

    specializations.forEach(spec => {

        const value = String(
            spec.Specialization_Name ?? ""
        ).trim();

        if (!value) return;

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        specializationFilter.appendChild(option);
    });


    // =================================================
    // STUDENT MODAL - SECTIONS
    // =================================================

    studentSection.innerHTML = `
        <option value="">بدون Section</option>
    `;

    console.log("Sections loaded:", sections);

    sections.forEach(section => {

        const value = String(
            section.Section_Name ?? ""
        ).trim();

        if (!value) return;

        const option = document.createElement("option");

        option.value = value;
        option.textContent = `Section ${value}`;

        studentSection.appendChild(option);
    });


    // =================================================
    // STUDENT MODAL - SPECIALIZATIONS
    // =================================================

    studentSpecialization.innerHTML = `
        <option value="">اختر التخصص</option>
    `;

    specializations.forEach(spec => {

        const value = String(
            spec.Specialization_Name ?? ""
        ).trim();

        if (!value) return;

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        studentSpecialization.appendChild(option);
    });
}


// ================= RENDER STUDENTS =================

function renderStudents() {

    const search =
        studentSearch.value
            .trim()
            .toLowerCase();

    const section =
        String(sectionFilter.value || "").trim();

    const department =
        String(departmentFilter.value || "").trim();

    const specialization =
        String(specializationFilter.value || "").trim();


    const filtered =
        students.filter(student => {

            const studentID =
                String(student.Student_ID ?? "").trim();

            const studentName =
                String(student.Student_Name ?? "").trim();

            const studentDepartment =
                String(student.Department ?? "").trim();

            const studentSpecialization =
                String(student.Specialization ?? "").trim();

            const studentSection =
                String(student.Section ?? "").trim();


            const matchesSearch =
                !search ||

                studentID
                    .toLowerCase()
                    .includes(search) ||

                studentName
                    .toLowerCase()
                    .includes(search) ||

                studentDepartment
                    .toLowerCase()
                    .includes(search) ||

                studentSpecialization
                    .toLowerCase()
                    .includes(search) ||

                studentSection
                    .toLowerCase()
                    .includes(search);


            const matchesSection =
                !section ||
                studentSection === section;


            const matchesDepartment =
                !department ||
                studentDepartment === department;


            const matchesSpecialization =
                !specialization ||
                studentSpecialization === specialization;


            return (
                matchesSearch &&
                matchesSection &&
                matchesDepartment &&
                matchesSpecialization
            );

        });


    studentsCount.textContent =
        `${filtered.length} طالب`;


    studentsTableBody.innerHTML = "";


    if (filtered.length === 0) {

        studentsEmpty.style.display =
            "block";

        return;
    }


    studentsEmpty.style.display =
        "none";


    filtered.forEach(student => {

        const studentID =
            String(student.Student_ID ?? "").trim();

        const studentName =
            String(student.Student_Name ?? "").trim();

        const studentDepartment =
            String(student.Department ?? "").trim();

        const studentSpecialization =
            String(student.Specialization ?? "").trim();

        const studentSection =
            String(student.Section ?? "").trim();


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(studentID)}
            </td>

            <td>
                <strong>
                    ${escapeHTML(studentName)}
                </strong>
            </td>

            <td>
                ${escapeHTML(studentDepartment)}
            </td>

            <td>
                ${escapeHTML(studentSpecialization)}
            </td>

            <td>
                ${
                    studentSection
                        ? `Section ${escapeHTML(studentSection)}`
                        : "—"
                }
            </td>

            <td>

                <div class="action-buttons">

                    <button
    class="table-action"
    title="تعديل"
    onclick="editStudent('${escapeJS(studentID)}')">
    <i class="fa-solid fa-pen-to-square"></i>
</button>

<button
    class="table-action print"
    title="طباعة"
    onclick="printStudent('${escapeJS(studentID)}')">
    <i class="fa-solid fa-print"></i>
</button>

<button
    class="table-action delete"
    title="حذف"
    onclick="deleteStudent('${escapeJS(studentID)}')">
    <i class="fa-solid fa-trash"></i>
</button>

                </div>

            </td>

        `;


        studentsTableBody.appendChild(row);

    });

}

// ================= STUDENT MODAL =================

function openStudentModal(student = null) {

    // التأكد إن السكاشن محدثة قبل فتح النافذة
    populateFilters();

    editingStudentId =
        student
            ? student.Student_ID
            : null;


    if (student) {

        modalTitle.textContent =
            "تعديل بيانات الطالب";

        modalSubtitle.textContent =
            "قم بتعديل البيانات المطلوبة";

        studentId.value =
            student.Student_ID || "";

        studentName.value =
            student.Student_Name || "";

        studentDepartment.value =
            student.Department || "";

        studentSpecialization.value =
            student.Specialization || "";


        // ============================
        // تحديد Section الطالب
        // ============================

        const currentSection =
            String(student.Section ?? "").trim();

        const sectionExists =
            Array.from(
                studentSection.options
            ).some(
                option =>
                    String(option.value).trim() ===
                    currentSection
            );

        if (sectionExists) {

            studentSection.value =
                currentSection;

        } else {

            studentSection.value = "";
        }


        studentId.disabled = true;

    } else {

        modalTitle.textContent =
            "إضافة طالب";

        modalSubtitle.textContent =
            "أدخل بيانات الطالب الجديد";

        studentForm.reset();

        // بعد reset نضمن إن السكاشن لسه موجودة
        populateFilters();

        studentId.disabled = false;
    }


    modalOverlay.classList.add("active");
}


function closeStudentModal() {

    modalOverlay.classList.remove(
        "active"
    );


    editingStudentId = null;


    studentForm.reset();


    studentId.disabled = false;

}


// ================= SUBMIT STUDENT =================

async function handleStudentSubmit(event) {

    event.preventDefault();


    const wasEditing =
        Boolean(editingStudentId);


    const student = {

        Student_ID:
            studentId.value.trim(),

        Student_Name:
            studentName.value.trim(),

        Department:
            studentDepartment.value.trim(),

        Specialization:
            studentSpecialization.value,

        Section:
            studentSection.value

    };


    if (
        !student.Student_ID ||
        !student.Student_Name
    ) {

        showToast(
            "من فضلك أدخل رقم واسم الطالب",
            "error"
        );

        return;

    }


    try {

        let result;


        if (wasEditing) {

            result =
                await apiPost({

                    action:
                        "updateStudent",

                    student:
                        student

                });

        } else {

            result =
                await apiPost({

                    action:
                        "addStudent",

                    student:
                        student

                });

        }


        if (!result.success) {

            showToast(
                result.message ||
                "حدث خطأ",
                "error"
            );

            return;

        }


        closeStudentModal();


        await loadAllData();


        showToast(
            wasEditing
                ? "تم تعديل بيانات الطالب"
                : "تم إضافة الطالب بنجاح"
        );


    } catch (error) {

        console.error(error);


        if (
            error.message !==
            "Unauthorized"
        ) {

            showToast(
                "حدث خطأ أثناء حفظ البيانات",
                "error"
            );

        }

    }

}


// ================= EDIT STUDENT =================

window.editStudent = function(id) {

    if (!authToken) {

        showLogin();

        return;

    }


    const student =
        students.find(
            s =>
                String(s.Student_ID) ===
                String(id)
        );


    if (!student) {

        showToast(
            "الطالب غير موجود",
            "error"
        );

        return;

    }


    openStudentModal(student);

};


// ================= DELETE STUDENT =================

window.deleteStudent =
    async function(id) {

        if (!authToken) {

            showLogin();

            return;

        }


        const student =
            students.find(
                s =>
                    String(s.Student_ID) ===
                    String(id)
            );


        if (!student) return;


        const confirmed =
            confirm(
                `هل أنت متأكد من حذف الطالب:\n\n${student.Student_Name}`
            );


        if (!confirmed) return;


        try {

            const result =
                await apiPost({

                    action:
                        "deleteStudent",

                    id:
                        id

                });


            if (!result.success) {

                showToast(
                    result.message ||
                    "فشل الحذف",
                    "error"
                );

                return;

            }


            await loadAllData();


            showToast(
                "تم حذف الطالب بنجاح"
            );


        } catch (error) {

            console.error(error);


            if (
                error.message !==
                "Unauthorized"
            ) {

                showToast(
                    "حدث خطأ أثناء حذف الطالب",
                    "error"
                );

            }

        }

    };


// ================= PRINT =================

window.printStudent =
    function(id) {

        const student =
            students.find(
                s =>
                    String(s.Student_ID) ===
                    String(id)
            );


        if (!student) return;


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=800,height=700"
            );


        printWindow.document.write(`

            <!DOCTYPE html>

            <html lang="ar" dir="rtl">

            <head>

                <meta charset="UTF-8">

                <title>
                    بيانات الطالب
                </title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        padding: 50px;
                        color: #1d2935;
                    }

                    .header {
                        text-align: center;
                        margin-bottom: 35px;
                    }

                    .header h1 {
                        color: #1b4a58;
                    }

                    .data {
                        border: 1px solid #ddd;
                        border-radius: 12px;
                        overflow: hidden;
                    }

                    .row {
                        display: flex;
                        border-bottom: 1px solid #eee;
                    }

                    .row:last-child {
                        border-bottom: 0;
                    }

                    .label {
                        width: 35%;
                        background: #f4f7f8;
                        padding: 16px;
                        font-weight: bold;
                    }

                    .value {
                        width: 65%;
                        padding: 16px;
                    }

                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #777;
                        font-size: 12px;
                    }

                </style>

            </head>


            <body>

                <div class="header">

                    <h1>
                        AITU Students
                    </h1>

                    <p>
                        بيانات الطالب
                    </p>

                </div>


                <div class="data">

                    <div class="row">

                        <div class="label">
                            رقم الطالب
                        </div>

                        <div class="value">
                            ${escapeHTML(student.Student_ID)}
                        </div>

                    </div>


                    <div class="row">

                        <div class="label">
                            اسم الطالب
                        </div>

                        <div class="value">
                            ${escapeHTML(student.Student_Name)}
                        </div>

                    </div>


                    <div class="row">

                        <div class="label">
                            القسم
                        </div>

                        <div class="value">
                            ${escapeHTML(student.Department)}
                        </div>

                    </div>


                    <div class="row">

                        <div class="label">
                            التخصص
                        </div>

                        <div class="value">
                            ${escapeHTML(student.Specialization)}
                        </div>

                    </div>


                    <div class="row">

                        <div class="label">
                            Section
                        </div>

                        <div class="value">
                            ${escapeHTML(
                                student.Section ||
                                "غير محدد"
                            )}
                        </div>

                    </div>

                </div>


                <div class="footer">
                    AITU Student Management System
                </div>


                <script>

                    window.onload = function() {
                        window.print();
                    };

                <\/script>

            </body>

            </html>

        `);


        printWindow.document.close();

    };


// ================= SECTIONS =================

// ================= SECTIONS =================

function renderSections() {

    sectionsGrid.innerHTML = "";

    if (sections.length === 0) {

        sectionsGrid.innerHTML = `
            <div class="section-card">

                <div class="section-number">
                    <i class="fa-solid fa-layer-group"></i>
                </div>

                <h3>
                    لا توجد Sections
                </h3>

                <p>
                    أضف Section جديد للبدء.
                </p>

            </div>
        `;

        return;
    }

    sections.forEach(section => {

        const name =
            section.Section_Name;

        const count =
            students.filter(
                student =>
                    String(student.Section).trim() ===
                    String(name).trim()
            ).length;

        const card =
            document.createElement("div");

        card.className =
            "section-card";

        card.innerHTML = `

            <div class="section-number">
                ${escapeHTML(name)}
            </div>

            <h3>
                Section ${escapeHTML(name)}
            </h3>

            <p>
                عدد الطلاب المسجلين في هذا السكشن
            </p>

            <div class="section-card-footer">

                <span class="section-count">
                    <i class="fa-solid fa-user-graduate"></i> ${count} طالب
                </span>

                <div class="action-buttons">

    <button
        class="section-view"
        type="button"
        onclick="viewSectionStudents('${escapeJS(name)}')">

        <i class="fa-solid fa-user-graduate"></i> عرض الطلاب

    </button>

    <button
        class="section-view"
        type="button"
        onclick="printSectionStudents('${escapeJS(name)}')">

        <i class="fa-solid fa-print"></i> طباعة

    </button>

    <button
        class="table-action delete"
        title="حذف"
        onclick="deleteSection('${escapeJS(section.Section_ID)}')">

        <i class="fa-solid fa-trash"></i>

    </button>

</div>


            </div>
        `;

        sectionsGrid.appendChild(card);
    });
}

// ================= VIEW SECTION STUDENTS =================

window.viewSectionStudents = function(sectionName) {


    if (!authToken) {
        showLogin();
        return;
    }

    const sectionStudents =
        students.filter(
            student =>
                String(student.Section).trim() ===
                String(sectionName).trim()
        );

    sectionStudentsTitle.textContent =
        `Section ${sectionName}`;

    sectionStudentsSubtitle.textContent =
        "قائمة الطلاب المسجلين داخل هذا الـ Section";

    sectionStudentsCount.textContent =
        sectionStudents.length;

    sectionStudentsBody.innerHTML = "";

    if (sectionStudents.length === 0) {

        sectionStudentsEmpty.style.display =
            "block";

    } else {

        sectionStudentsEmpty.style.display =
            "none";

        sectionStudents.forEach(student => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${escapeHTML(student.Student_ID)}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(student.Student_Name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(student.Department)}
                </td>

                <td>
                    ${escapeHTML(student.Specialization)}
                </td>

            `;

            sectionStudentsBody.appendChild(row);
        });
    }

    sectionStudentsOverlay.classList.add(
        "active"
    );
};
// ================= PRINT SECTION STUDENTS =================

window.printSectionStudents = function(sectionName) {

    if (!authToken) {
        showLogin();
        return;
    }

    const sectionStudents =
        students.filter(
            student =>
                String(student.Section).trim() ===
                String(sectionName).trim()
        );

    if (sectionStudents.length === 0) {

        showToast(
            "لا يوجد طلاب داخل هذا الـ Section",
            "error"
        );

        return;
    }

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=700"
        );

    if (!printWindow) {

        showToast(
            "السماح بالـ Pop-ups مطلوب للطباعة",
            "error"
        );

        return;
    }

    const rows =
        sectionStudents.map(
            (student, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(student.Student_ID)}
                        </td>

                        <td>
                            ${escapeHTML(student.Student_Name)}
                        </td>

                        <td>
                            ${escapeHTML(student.Department)}
                        </td>

                        <td>
                            ${escapeHTML(student.Specialization)}
                        </td>

                    </tr>
                `;
            }
        ).join("");

    const currentDate =
        new Date().toLocaleDateString(
            "ar-EG",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="ar" dir="rtl">

        <head>

            <meta charset="UTF-8">

            <title>
                كشف طلاب Section ${escapeHTML(sectionName)}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family:
                        Arial,
                        Tahoma,
                        sans-serif;

                    margin: 0;
                    padding: 35px;

                    color: #1d2935;

                    direction: rtl;
                }

                .header {
                    text-align: center;
                    margin-bottom: 25px;
                }

                .header h1 {
                    margin: 0 0 8px;

                    font-size: 26px;

                    color: #1b4a58;
                }

                .header h2 {
                    margin: 0 0 8px;

                    font-size: 21px;
                }

                .header p {
                    margin: 5px 0;

                    color: #666;

                    font-size: 14px;
                }

                .info {
                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;

                    margin-bottom: 20px;

                    padding: 12px 16px;

                    border: 1px solid #ddd;

                    border-radius: 8px;

                    background: #f7f9fa;
                }

                .info strong {
                    color: #1b4a58;
                }

                table {
                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 10px;
                }

                th,
                td {
                    border: 1px solid #ccc;

                    padding: 10px 8px;

                    text-align: center;

                    font-size: 13px;
                }

                th {
                    background: #1b4a58;

                    color: white;

                    font-weight: bold;
                }

                tbody tr:nth-child(even) {
                    background: #f7f7f7;
                }

                .footer {
                    margin-top: 25px;

                    display: flex;

                    justify-content:
                        space-between;

                    font-size: 12px;

                    color: #777;
                }

                @media print {

                    body {
                        padding: 10px;
                    }

                    .no-print {
                        display: none;
                    }

                    th {
                        background: #1b4a58 !important;

                        color: white !important;

                        -webkit-print-color-adjust:
                            exact;

                        print-color-adjust:
                            exact;
                    }

                }

            </style>

        </head>

        <body>

            <div class="header">

                <h1>
                    طلاب الفرقة الاولي معلومات
                </h1>

                <h2>
                    كشف طلاب Section ${escapeHTML(sectionName)}
                </h2>

                <p>
                    قائمة الطلاب المسجلين داخل السيكشن
                </p>

            </div>

            <div class="info">

                <div>
                    <strong>
                        Section:
                    </strong>

                    ${escapeHTML(sectionName)}
                </div>

                <div>
                    <strong>
                        عدد الطلاب:
                    </strong>

                    ${sectionStudents.length}
                </div>

            </div>

            <table>

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            كود الطالب
                        </th>

                        <th>
                            اسم الطالب
                        </th>

                        <th>
                            القسم
                        </th>

                        <th>
                            التخصص
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

            <div class="footer">

                <span>
                    تاريخ الطباعة:
                    ${currentDate}
                </span>

                <span>
                    AITU Students Management System
                </span>

            </div>

            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);

    printWindow.document.close();

};
function closeSectionStudentsModal() {

    if (!sectionStudentsOverlay) {
        return;
    }

    sectionStudentsOverlay.classList.remove(
        "active"
    );

    sectionStudentsBody.innerHTML = "";
}
// ================= ADD SECTION =================

async function addNewSection() {

    if (!authToken) {

        showLogin();

        return;

    }


    const name =
        prompt(
            "اكتب اسم الـSection الجديد:"
        );


    if (!name) return;


    const exists =
        sections.some(
            section =>
                String(
                    section.Section_Name
                )
                    .trim() ===
                String(name)
                    .trim()
        );


    if (exists) {

        showToast(
            "الـSection موجود بالفعل",
            "error"
        );

        return;

    }


    try {

        const nextId =
            sections.length + 1;


        const result =
            await apiPost({

                action:
                    "addSection",

                section: {

                    Section_ID:
                        nextId,

                    Section_Name:
                        name,

                    Capacity:
                        "",

                    Notes:
                        ""

                }

            });


        if (!result.success) {

            showToast(
                result.message ||
                "فشل إضافة الـSection",
                "error"
            );

            return;

        }


        await loadAllData();


        showToast(
            "تم إضافة الـSection"
        );


    } catch (error) {

        console.error(error);


        if (
            error.message !==
            "Unauthorized"
        ) {

            showToast(
                "حدث خطأ أثناء إضافة الـSection",
                "error"
            );

        }

    }

}


// ================= DELETE SECTION =================

window.deleteSection =
    async function(id) {

        if (!authToken) {

            showLogin();

            return;

        }


        const section =
            sections.find(
                s =>
                    String(s.Section_ID) ===
                    String(id)
            );


        if (!section) return;


        const studentsInSection =
            students.filter(
                student =>
                    String(student.Section) ===
                    String(section.Section_Name)
            );


        if (
            studentsInSection.length > 0
        ) {

            alert(
                `لا يمكن حذف Section ${section.Section_Name}\n\nيوجد ${studentsInSection.length} طالب بداخله.\n\nقم بنقل الطلاب أولاً.`
            );

            return;

        }


        const confirmed =
    confirm(
        `هل تريد حذف Section ${section.Section_Name}؟`
    );


        if (!confirmed) return;


        try {

            const result =
                await apiPost({

                    action:
                        "deleteSection",

                    id:
                        id

                });


            if (!result.success) {

                showToast(
                    result.message ||
                    "فشل الحذف",
                    "error"
                );

                return;

            }


            await loadAllData();


            showToast(
                "تم حذف الـSection"
            );


        } catch (error) {

            console.error(error);


            if (
                error.message !==
                "Unauthorized"
            ) {

                showToast(
                    "حدث خطأ أثناء حذف الـSection",
                    "error"
                );

            }

        }

    };


// ================= STATISTICS =================

function renderStatistics() {

    const sectionContainer =
        document.getElementById(
            "sectionStatistics"
        );


    const specializationContainer =
        document.getElementById(
            "specializationStatistics"
        );


    sectionContainer.innerHTML = "";

    specializationContainer.innerHTML = "";


    // Sections

    sections.forEach(section => {

        const name =
            section.Section_Name;


        const count =
            students.filter(
                student =>
                    String(student.Section) ===
                    String(name)
            ).length;


        addStatRow(
            sectionContainer,
            name,
            count,
            students.length
        );

    });


    // Specializations

    const specializationCounts = {};


    students.forEach(student => {

        const name =
            student.Specialization ||
            "غير محدد";


        specializationCounts[name] =
            (
                specializationCounts[name] ||
                0
            ) + 1;

    });


    Object.entries(
        specializationCounts
    ).forEach(
        ([name, count]) => {

            addStatRow(
                specializationContainer,
                name,
                count,
                students.length
            );

        }
    );

}


function addStatRow(
    container,
    name,
    count,
    total
) {

    const percentage =
        total > 0
            ? Math.round(
                (count / total) * 100
            )
            : 0;


    container.innerHTML += `

        <div class="stat-row">

            <div class="stat-row-header">

                <span>
                    ${escapeHTML(name)}
                </span>

                <strong>
                    ${count}
                </strong>

            </div>


            <div class="progress">

                <span
                    style="width:${percentage}%">
                </span>

            </div>

        </div>

    `;

}


// ================= TOAST =================

function showToast(
    message,
    type = "success"
) {

    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    if (type === "error") {

        toast.style.background =
            "#e34d59";

    } else {

        toast.style.background =
            "#1b4a58";

    }


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}


// ================= HELPERS =================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function escapeJS(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

}
function printAllStudents() {

    if (!students || students.length === 0) {
        showToast(
            "warning",
            "لا يوجد طلاب لطباعتهم"
        );
        return;
    }

    const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800"
    );

    if (!printWindow) {
        showToast(
            "error",
            "يرجى السماح بالنوافذ المنبثقة للطباعة"
        );
        return;
    }

    const printDate =
        new Date().toLocaleString(
            "ar-EG",
            {
                dateStyle: "full",
                timeStyle: "short"
            }
        );

    const rows = students
        .map((student, index) => {

            return `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(
                            student.Student_ID || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student.Student_Name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student.Department || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student.Specialization || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student.Section || "-"
                        )}
                    </td>

                </tr>
            `;

        })
        .join("");

    printWindow.document.write(`
        <!DOCTYPE html>

        <html
            lang="ar"
            dir="rtl"
        >

        <head>

            <meta charset="UTF-8">

            <title>
                طلاب الفرقة الأولى IT
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family:
                        Arial,
                        "Tahoma",
                        sans-serif;

                    margin: 0;
                    padding: 25px;

                    color: #222;

                    background: white;
                }

                .print-header {
                    text-align: center;

                    margin-bottom: 25px;

                    border-bottom:
                        3px solid #1b4a58;

                    padding-bottom: 18px;
                }

                .print-header h1 {
                    margin: 0 0 8px;

                    font-size: 26px;

                    color: #1b4a58;
                }

                .print-header p {
                    margin: 5px 0;

                    font-size: 14px;

                    color: #666;
                }

                .summary {
                    display: flex;

                    justify-content:
                        space-between;

                    margin-bottom: 18px;

                    padding: 12px 16px;

                    background: #f2f4f6;

                    border-radius: 8px;

                    font-size: 14px;
                }

                table {
                    width: 100%;

                    border-collapse:
                        collapse;

                    font-size: 13px;
                }

                th,
                td {
                    border:
                        1px solid #ccc;

                    padding: 9px 7px;

                    text-align: center;

                    vertical-align: middle;
                }

                th {
                    background: #1b4a58;

                    color: white;

                    font-weight: 700;
                }

                tr:nth-child(even) td {
                    background: #f8f8f8;
                }

                .footer {
                    margin-top: 20px;

                    text-align: center;

                    font-size: 12px;

                    color: #777;
                }

                @page {
                    size: A4 landscape;

                    margin: 12mm;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                    .no-print {
                        display: none;
                    }

                }

            </style>

        </head>

        <body>

            <div class="print-header">

                <h1>
                    طلاب الفرقة الأولى IT
                </h1>

                <p>
                    كشف جميع الطلاب المقيدين
                </p>

            </div>


            <div class="summary">

                <span>
                    إجمالي الطلاب:
                    <strong>
                        ${students.length}
                    </strong>
                </span>

                <span>
                    تاريخ الطباعة:
                    <strong>
                        ${printDate}
                    </strong>
                </span>

            </div>


            <table>

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            كود الطالب
                        </th>

                        <th>
                            اسم الطالب
                        </th>

                        <th>
                            القسم
                        </th>

                        <th>
                            التخصص
                        </th>

                        <th>
                            Section
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="footer">

                طلاب الفرقة الأولى IT

            </div>


            <script>

                window.onload = function () {

                    window.print();

                };

            <\/script>

        </body>

        </html>
    `);

    printWindow.document.close();
}