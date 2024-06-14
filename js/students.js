const params=new URLSearchParams(location.search);
const teacherId = params.get('teacherId');

let studentForm=document.getElementById("studentForm");
let studentModal=document.getElementById("studentModal");
let studentFormSubmitBtn=document.getElementById("student-form-submit-btn");
let showModalBtnStudent=document.getElementById("show-modal-btn-student");

let studentsRow=document.querySelector(".students-row");
let studentsQuantity=document.querySelector(".students-quantity");
let studentsSearchInput=document.getElementById("students-search-input");
let teachersSelect=document.getElementById("teachers-select");
let pagination=document.querySelector(".students-pagination");
let limitSelect=document.getElementById("limit-select");

let search= params.get("search")  || "";
let teacher=teacherId;
let selected=null;
let activePage=+params.get("activePage") || 1;
let studentsLength=0;
let limit=+params.get('limit') || LIMIT2;

studentsSearchInput.value=search;

function getStudentCard({firstName,avatar,lastName,isWork,phoneNumber,teacherId,id}){
  return `
  <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
   <div class="card teacher-card">
    <img src=${avatar} class="card-img-top" alt=${firstName}>
    <div class="card-body">
      <h5 class="card-title">${firstName} ${lastName}</h5>
      <p class="card-phone"><span>Phone:</span>${phoneNumber}</p>
      <p class="card-boolen"><span>isWork:</span> ${isWork}</p>
      <button class="btn btn-warning"
      data-bs-toggle="modal" data-bs-target="#studentModal"
      onClick="editStudent(${id})"
      >Edit</button>
      <button
      onClick="deleteStudent(${id})"
       class="btn btn-danger">Delete</button>
    </div>
   </div>
  </div>
  `
 }


async function getStudents(){
  try{

    setQuery();

    studentsRow.innerHTML="loading...";
    let params={firstName:search,page:activePage,limit}
    let {data} = await request.get(`teacher/${teacher}/student` , {params : {firstName:search}});
    let {data : pageStudents} = await request.get(`teacher/${teacher}/student` , {params});

    studentsLength=data.length;

    studentsQuantity.textContent=studentsLength;


    studentsRow.innerHTML="";

    getPaginition();

    pageStudents.map((student)=>{
      studentsRow.innerHTML += getStudentCard(student)
    })
  }
  catch(err){
    studentsQuantity.textContent=0;
    studentsQuantity.textContent=0;
    studentsRow.innerHTML=`<p class="students-error">Not found students</p>`;
    pagination.innerHTML="";
    console.log(err);
  }
}
getStudents()

function getPaginition(){
  let pages=Math.ceil( studentsLength / limit);
  if(studentsLength<=limit){
    pagination.innerHTML="";
  }else{
    pagination.innerHTML =`<li class="page-item ${activePage ===1 ? "disabled" : ""}"><button class="page-link" onClick="getPage('-') ">Previous</button></li>`;

    for(let i=1;i<=pages;i++){
      pagination.innerHTML += `<li class="page-item ${i === activePage ? "active" : ""}"><button  class="page-link" onClick="getPage(${i})">${i}</button></li>`;
    }

    pagination.innerHTML += `<li class="page-item ${activePage === pages ? "disabled" : ""}"><button class="page-link" onClick="getPage('+')">Next</button></li>`
  }
}
function getPage( i ){
  if(i==='-'){
    activePage--;
  }
  else if(i === '+'){
    activePage++
  }else{
    activePage = i;
  }
  getStudents();
}

//search
studentsSearchInput.addEventListener('input',(e)=>{
  search = e.target.value;
  activePage=1;
  getStudents();
});

async function getTeachers(){
  try{
    let {data} = await request.get(`teacher`);
    data.map(({id,firstName})=>{
      teachersSelect.innerHTML += `<option ${id === teacher ? 'selected ' : ``}  value="${id}">${firstName}</option>`
    })
  }
  catch(err){
    console.log(err);
  }
}
getTeachers()

teachersSelect.addEventListener('change',function(e){
  teacher = e.target.value;

  getStudents();
});



studentForm.addEventListener('submit',async (e)=>{
  e.preventDefault();
 let avatar= e.target.elements.avatar.value;
 let firstName= e.target.elements.firstName.value;
 let lastName= e.target.elements.lastName.value;
 let isWork= e.target.elements.isWork.value;
 let phoneNumber= e.target.elements.phoneNumber.value;

 const student={avatar,firstName,lastName,isWork,phoneNumber}
 if(selected === null){
   await request.post(`teacher/${teacher}/student`,student);
 }else{
   await request.put(`teacher/${teacher}/student/${selected}`,student)
 }

  getStudents();
  bootstrap.Modal.getInstance(studentModal).hide();
  studentForm.reset();
})

async function deleteStudent(id) {
  let isDeleted = confirm("Are you sure you want to delete this teacher ?");
  if (isDeleted) {
    await request.delete(`teacher/${teacher}/student/${id}`);
    getStudents();
  }
}

async function editStudent(id){
  let {data} = await request.get(`teacher/${teacher}/student/${id}`);
  studentForm.elements.firstName.value=data.firstName;
  studentForm.elements.image.value=data.image;
  studentForm.elements.lastName.value=data.lastName;
  studentForm.elements.isWork.value=data.isWork;
  studentForm.elements.phoneNumber.value=data.phoneNumber;

  selected=id;

  studentFormSubmitBtn.textContent="Save";
}

showModalBtnStudent.addEventListener('click',function(){
  selected=null;
  studentForm.reset();
  studentFormSubmitBtn.textContent="Add";
});

limitSelect.addEventListener('change',function(e){
  activePage=1;
  limit =e.target.value;
  getStudents();
})

function setQuery(){
  params.set('search',search)
  params.set('teacherId', teacher);
  params.set('limit', limit);
  const newUrl = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, '', newUrl);
 }

 window.onload = () => {
  limitSelect.value = limit;
  getStudents();
};