let navbar = document.querySelector('.header .flex .navbar');
let profile = document.querySelector('.header .flex .profile');

document.querySelector('#menu-btn').onclick = () =>{
   navbar.classList.toggle('active');
   profile.classList.remove('active');
}

document.querySelector('#user-btn').onclick = () =>{
   profile.classList.toggle('active');
   navbar.classList.remove('active');
}

window.onscroll = () =>{
   profile.classList.remove('active');
   navbar.classList.remove('active');
}

function loader(){
   document.querySelector('.loader').style.display = 'none';
}

function fadeOut(){
   setInterval(loader, 2000);
}

window.onload = fadeOut;

function checkPassword(){
   let password=document.getElementById("new_pass").value;
   let confirm_password=document.getElementById("confirm_pass").value;
   let message=document.getElementById("message");

   if(password.length !=0){
       if(password == confirm_password){
           message.textContent="PassWord Match";
         
       }
       else{
           message.textContent="Password Don't Match";
       }
   }
}



