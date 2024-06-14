
const request = axios.create({
  baseURL : `https://6651825d20f4f4c44277e14a.mockapi.io/`,
  timeout : 10000
})

const LIMIT=10;
const LIMIT2=2;

let customNavbar=document.querySelector(".custom-navbar");
let btnDarkLight=document.querySelector(".btn-dark-light");
let darkLightImage=document.querySelector(".btn-dark-light img")

let navbar=document.querySelector("nav")

window.addEventListener('scroll',function(){
  if(scrollY>100){
   navbar.classList.remove("custom-navbar");
  }else{
    navbar.classList.add("custom-navbar");
  }
});
