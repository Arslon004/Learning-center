const params = new URLSearchParams(location.search);

let teachersRow = document.querySelector(".teachers-row");
let teacherForm = document.getElementById("teacherForm");
let teacherModal = document.getElementById("teacherModal");
let teacherFormSubmitBtn = document.getElementById("teacher-form-submit-btn");
let showModalBtn = document.getElementById("show-modal-btn");
let teacherSearchInput = document.getElementById("teacher-search-input");
let teachersQuantity = document.querySelector(".teachers-quantity");
let teacherSortSelect = document.getElementById("teacher-sort-select");
let pagination = document.querySelector(".teachers-pagination");
let limitSelect=document.getElementById("limit-select");

let selected = null;
let search = params.get("search") || "";
let teacherSort = params.get("teacherSort") || "";
let activePage = +params.get("activePage") || 1;
let limit=+params.get("limit") || LIMIT;

let teachersLength = 0;

teacherSearchInput.value = search;

function getTeacherCard({
  firstName,
  avatar,
  lastName,
  isMarried,
  phoneNumber,
  email,
  id,
}) {
  return `
  <div class="col-12 col-sm-6 col-md-4 col-lg-3 my-3">
   <div class="card teacher-card">
    <img src=${avatar} class="card-img-top" alt=${firstName}>
    <div class="card-body">
      <h5 class="card-title">${firstName} ${lastName}</h5>
      <p class="card-email"><span>Email:</span>${email}</p>
      <p class="card-phone"><span>Phone:</span>${phoneNumber}</p>
      <p class="card-boolen"><span>isMarried:</span> ${isMarried}</p>
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
  `;
}

async function getTeachers() {
  try {
    setQuery();

    teachersRow.innerHTML = "loading...";
    // let params={sort=By:'email',order:'desc'}
    let [orderBy, order] = teacherSort.split("-");
    let params = {
      firstName: search,
      orderBy,
      order,
      page: activePage,
      limit
    }
    let { data } = await request.get(`teacher`, {
      params: { firstName: search },
    });

    let { data: pageTeachers } = await request.get(`teacher`, { params });

    teachersLength = data.length;
    teachersQuantity.textContent = teachersLength;

    teachersRow.innerHTML = "";

    getPaginition();

    pageTeachers.map((teacher) => {
      teachersRow.innerHTML += getTeacherCard(teacher);
    });
  } catch (err) {
    console.log(err.response?.data);
    teachersQuantity.textContent = 0;
    teachersRow.innerHTML = `<p class="teachers-error">Not found teachers</p>`;
    pagination.innerHTML = "";
  } finally {
    console.log("Working...");
  }
}
getTeachers();

function getPaginition() {
  let pages = Math.ceil(teachersLength / limit);
  if (teachersLength <= limit) {
    pagination.innerHTML = "";
  } else {
    pagination.innerHTML = `<li class="page-item ${
      activePage === 1 ? "disabled" : ""
    }"><button class="page-link" onClick="getPage('-') ">Previous</button></li>`;

    for (let i = 1; i <= pages; i++) {
      pagination.innerHTML += `<li class="page-item ${
        i === activePage ? "active" : ""
      }"><button  class="page-link" onClick="getPage(${i})">${i}</button></li>`;
    }

    pagination.innerHTML += `<li class="page-item ${
      activePage === pages ? "disabled" : ""
    }"><button class="page-link" onClick="getPage('+')">Next</button></li>`;
  }
}

function getPage(i) {
  if (i === "-") {
    activePage--;
  } else if (i === "+") {
    activePage++;
  } else {
    activePage = i;
  }
  getTeachers();
}

teacherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const image = e.target.elements.image.value;
  const firstName = e.target.elements.firstName.value;
  const lastName = e.target.elements.lastName.value;
  const email = e.target.elements.email.value;
  const phoneNumber = e.target.elements.phoneNumber.value;
  const isMarried = e.target.elements.isMarried.value;

  const teacher = {
    image,
    firstName,
    lastName,
    email,
    phoneNumber,
    isMarried,
  }

  if (selected === null) {
    await request.post(`teacher`, teacher);
  } else {
    await request.put(`teacher/${selected}`, teacher);
  }

  getTeachers();
  bootstrap.Modal.getInstance(teacherModal).hide();
  teacherForm.reset();
});

async function editTeacher(id) {
  let {
    data: { image, firstName, lastName, phoneNumber, email, isMarried },
  } = await request.get(`teacher/${id}`);

  teacherForm.elements.image.value = image;
  teacherForm.elements.firstName.value = firstName;
  teacherForm.elements.lastName.value = lastName;
  teacherForm.elements.email.value = email;
  teacherForm.elements.phoneNumber.value = phoneNumber;
  teacherForm.elements.isMarried.value = isMarried;

  selected = id;
  teacherFormSubmitBtn.textContent = "Save";
}

showModalBtn.addEventListener("click", () => {
  selected = null;
  teacherForm.reset();
  teacherFormSubmitBtn.textContent = "Add";
});

async function deleteTeacher(id) {
  let isDeleted = confirm("Are you sure you want to delete this teacher ?");
  if (isDeleted) {
    await request.delete(`teacher/${id}`);
    getTeachers();
  }
}

//search
teacherSearchInput.addEventListener("input", function (e) {
  search = e.target.value;
  activePage = 1;
  getTeachers();
});

teacherSortSelect.addEventListener("change", (e) => {
  teacherSort = e.target.value;
  getTeachers();
});

limitSelect.addEventListener('change',(e)=>{
  activePage=1;
  limit=e.target.value;
  getTeachers()
})

function setQuery() {
  params.set("search", search);
  params.set("teacherSort", teacherSort);
  params.set("activePage", activePage);
  params.set("limit", limit);
  const newUrl = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, "", newUrl);
}
window.onload = () => {
  limitSelect.value = limit;
  getStudents();
};
