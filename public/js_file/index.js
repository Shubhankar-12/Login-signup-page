const signinBtn = document.getElementById("sign_in");
const signupBtn = document.getElementById("sign_up");
const body = document.querySelector('body');
const formBx = document.querySelector(".formBx");
const imgDiv = document.getElementById('dpContainer');
const img = document.getElementById('photo');
const file = document.getElementById('file');
const uploadBtn = document.getElementById('uploadBtn');

signupBtn.onclick = () => {
    formBx.classList.add('active')
    body.classList.add('active')
}

signinBtn.onclick = () => {
    formBx.classList.remove('active')
    body.classList.remove('active')
}
imgDiv.addEventListener('mouseenter', () => {
    uploadBtn.style.display = "block";
});


imgDiv.addEventListener('mouseleave', () => {
    uploadBtn.style.display = "none";
});
file.addEventListener('change', function () {
    const chooseFile = this.files[0];

    if (chooseFile) {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            img.setAttribute('src', reader.result);
            profile_pic_url = reader.result;
        });
        reader.readAsDataURL(chooseFile)
    }
})