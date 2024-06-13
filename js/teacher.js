let teachersRow = document.querySelector(".teachers-row");
let teacherForm = document.getElementById("teacherForm");
let teacherModal = document.getElementById("teacherModal");
let teacherFormSubmitBtn = document.getElementById("teacher-form-submit-btn");
let showModalBtn = document.getElementById("show-modal-btn");
let teacherSearchInput = document.getElementById("teacher-search-input");
let teachersQuantity = document.querySelector(".teachers-quantity");
let teacherSortSelect = document.getElementById("teacher-sort-select");



let selected = null;
let search = "";
let teacherSort = "";

function getTeacherCard({
  firstName,
  avatar,
  lastName,
  isMarried,
  phoneNumber,
  email,
  id
}) {
  return `
  <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
   <div class="card teacher-card">
    <img src=${avatar} class="card-img-top" alt=${firstName}>
    <div class="card-body">
      <h5 class="card-title">${firstName} ${lastName}</h5>
      <p class="card-email">${email}</p>
      <p class="card-phone"><span>Phone:</span>${phoneNumber}</p>
      <p class="card-isMarr">isMarried: ${isMarried}</p>
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

async function getTeachers() {
  try {
    teachersRow.innerHTML = "loading...";
    // let params={sort=By:'email',order:'desc'}
    let [orderBy, order] = teacherSort.split("-")
    let params = {
      firstName: search,
      orderBy,
      order
    }
    let {
      data
    } = await request.get(`teacher`, {
      params
    });

    teachersQuantity.textContent = data.length;

    teachersRow.innerHTML = "";
    data.map((teacher) => {
      teachersRow.innerHTML += getTeacherCard(teacher)
    })
  } catch (err) {
    console.log(err.response?.data);
    teachersRow.innerHTML = "Not found"
  } finally {
    console.log("Working...");
  }
}
getTeachers();

teacherForm.addEventListener('submit', async (e) => {
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
    isMarried
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
    data: {
      image,
      firstName,
      lastName,
      phoneNumber,
      email,
      isMarried
    }
  } = await request.get(`teacher/${id}`);

  teacherForm.elements.image.value = image;
  teacherForm.elements.firstName.value = firstName;
  teacherForm.elements.lastName.value = lastName;
  teacherForm.elements.email.value = email;
  teacherForm.elements.phoneNumber.value = phoneNumber;
  teacherForm.elements.isMarried.value = isMarried;

  selected = id;
  teacherFormSubmitBtn.textContent = "Save"
}

showModalBtn.addEventListener('click', () => {
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

teacherSearchInput.addEventListener("input", function (e) {
  search = e.target.value;
  getTeachers();
});

teacherSortSelect.addEventListener('change', (e) => {
  teacherSort = e.target.value;
  getTeachers();
});