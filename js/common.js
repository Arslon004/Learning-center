let params = new URLSearchParams(location.search);
const teacherId = params.get('teacherId');

let studentsRow=document.querySelector(".students-row");
let studentsSearchInput=document.getElementById("students-search-input");
let studentsQuantity=document.querySelector(".students-quantity");
let teachersSelect=document.getElementById("teachers-select")

let search=params.get( 'search' ) || "";
let teacher=teacherId;

studentsSearchInput.value=search;


function getStudentCard({firstName,avatar,lastName,isWork,phoneNumber,teacherId,id}){
 return `
 <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
  <div class="card teacher-card">
   <img src=${avatar} class="card-img-top" alt=${firstName}>
   <div class="card-body">
     <h5 class="card-title">${firstName} ${lastName}</h5>
     <p class="card-phone"><span>Phone:</span>${phoneNumber}</p>
     <p class="card-isMarr">isWork: ${isWork}</p>
     <button class="btn btn-warning"
     data-bs-toggle="modal" data-bs-target="#teacherModal"
     onClick="editTeacher(${id})"
     >Edit</button>
     <button
     onClick="deleteTeacher(${id})"
      class="btn btn-danger">Delete</button>
     <a href="./students.html?teacherId=${id}" class="btn btn-primary">Students </a>
   </div>
  </div>
 </div>
 `
}

async function getStudents(){
 try{

   setQuery();

   studentsRow.innerHTML="loading...";
   let params={firstName:search}
   let {data}= await request.get(`teacher/${teacher}/student`,{params});

   studentsQuantity.textContent = data.length;

   studentsRow.innerHTML=""
   data.map((student)=>{
     studentsRow.innerHTML += getStudentCard(student)
   });
 }
 catch(err){
   studentsQuantity.textContent =0;
   studentsRow.innerHTML = "Not found"
 }
}
getStudents();

studentsSearchInput.addEventListener('input',(e)=>{
 search = e.target.value;
 setQuery()
 getStudents();
});

async function getTeachers(){
 try{
   let {data}=await request.get( 'teacher' );
   data.map(({id,firstName})=>{
     teachersSelect.innerHTML += `<option ${id === teacher ? 'selected ' : ``} value=${id}>${firstName}</option>`
   })
 }
 catch(err){
   console.log(err);
 }
}
getTeachers()

teachersSelect.addEventListener('change', function(e) {
 teacher = e.target.value;

 getStudents();
});

function setQuery(){
 params.set('search',search)
 params.set('teacherId', teacher);
 const newUrl = `${location.pathname}?${params.toString()}`;
 history.replaceState(null, '', newUrl);
}


async function getPage(i) {
  if (i === '-') {
    activePage--;
  } else if (i === '+') {
    activePage++;
  } else {
    activePage = i;
  }
  await getTeachers();
}

getPage()

function getPagination() {
  let pages = Math.ceil(teachersLength / LIMIT);
  pagination.innerHTML = `<li class="page-item ${activePage === 1 ? "disabled" : ""}"><button onClick="getPage('-')" class="page-link">Previous</button></li>`;

  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML += `<li class="page-item ${i === activePage ? "active" : ""}"><button onClick="getPage(${i})" class="page-link">${i}</button></li>`;
  }

  pagination.innerHTML += `<li class="page-item ${activePage === pages ? "disabled" : ""}"><button onClick="getPage('+')" class="page-link">Next</button></li>`;
}