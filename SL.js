function handleCredentialResponse(response) {
    console.log("JWT ID Token: " + response.credential);
    
    // (Optional) คุณสามารถ Decode JWT Token เพื่อดึงชื่อและอีเมลของผู้ใช้มาใช้งานได้
    // ในที่นี้เราทำการบันทึกสถานะการล็อกอินชั่วคราวไว้ที่ localStorage
    localStorage.setItem("userLoggedIn", "true");
    
    alert("เข้าสู่ระบบด้วย Google สำเร็จ!");
    
    // เปลี่ยนหน้าไปหน้าหลักของเว็บ
    window.location.href = "dashboard.html";
}

window.onload = function () {
  google.accounts.id.initialize({
  client_id: "133288929520-j8tpe6hbnbdbv5jccgva197ur6e0ggqa.apps.googleusercontent.com",
  callback: handleCredentialResponse
});

  // สร้างปุ่ม Google Sign-In
  google.accounts.id.renderButton(
    document.querySelector(".google-btn"),
    { theme: "outline", size: "large", text: "signup_with" }
  );

  google.accounts.id.prompt(); // แสดง popup ถ้ามี session อยู่แล้ว
};
