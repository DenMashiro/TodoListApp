// Menyimpan dan memuat data dari localStorage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Memperbarui prioritas berdasarkan tenggat waktu
function updatePriorities(data) {
    const currentDate = new Date();
    data.forEach(item => {
        const deadlineDate = new Date(item.deadline);
        const timeDifference = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24)); // Dalam hari
        if (timeDifference > 7) {
            item.priority = 'Rendah';
        } else if (timeDifference > 3) {
            item.priority = 'Sedang';
        } else {
            item.priority = 'Tinggi';
        }
    });
    saveToLocalStorage('todoData', data);
}

// Menghitung waktu tersisa
function calculateTimeRemaining(deadline) {
    const currentTime = new Date();
    const deadlineTime = new Date(deadline);
    const difference = deadlineTime - currentTime;

    if (difference <= 0) {
        return "Waktu Habis";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (days > 0) {
        return `${days}h ${hours}j`;
    }

    return `${hours}j ${minutes}m ${seconds}d`;
}

// Render tabel utama
function renderTable(data, search = '') {
    const tableBody = document.querySelector('#todo-table tbody');
    tableBody.innerHTML = '';

    const filteredData = data.filter(item =>
        item.task.toLowerCase().includes(search.toLowerCase())
    );

    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');

        const taskCell = document.createElement('td');
        taskCell.textContent = item.task;
        row.appendChild(taskCell);

        const deadlineCell = document.createElement('td');
        deadlineCell.textContent = item.deadline.replace('T', ' ');
        row.appendChild(deadlineCell);

        const priorityCell = document.createElement('td');
        priorityCell.textContent = item.priority;
        priorityCell.classList.add(item.priority.toLowerCase());
        row.appendChild(priorityCell);

        const timeRemainingCell = document.createElement('td');
        timeRemainingCell.textContent = calculateTimeRemaining(item.deadline);
        row.appendChild(timeRemainingCell);

        const actionCell = document.createElement('td');
        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Selesai';
        completeBtn.addEventListener('click', () => {
            addToHistory(item);
            data.splice(index, 1);
            saveToLocalStorage('todoData', data);
            renderTable(data, search);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.addEventListener('click', () => {
            data.splice(index, 1);
            saveToLocalStorage('todoData', data);
            renderTable(data, search);
        });

        actionCell.appendChild(completeBtn);
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

// Menyimpan tugas selesai ke riwayat
function addToHistory(task) {
    const history = loadFromLocalStorage('historyData');
    history.push(task);
    saveToLocalStorage('historyData', history);
}

// Render tabel riwayat
function renderHistory() {
    const history = loadFromLocalStorage('historyData');
    const tableBody = document.querySelector('#history-table tbody');
    tableBody.innerHTML = '';

    history.forEach((item, index) => {
        const row = document.createElement('tr');

        const taskCell = document.createElement('td');
        taskCell.textContent = item.task;
        row.appendChild(taskCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = item.deadline.replace('T', ' ');
        row.appendChild(dateCell);

        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.addEventListener('click', () => {
            history.splice(index, 1);
            saveToLocalStorage('historyData', history);
            renderHistory();
        });

        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
    });
}

// Event untuk tombol tambah
document.getElementById('add-todo').addEventListener('click', () => {
    const input = document.getElementById('todo-input');
    const deadlineDate = document.getElementById('deadline-date').value;
    const deadlineTime = document.getElementById('deadline-time').value;

    if (!input.value || !deadlineDate || !deadlineTime) {
        alert('Lengkapi semua data!');
        return;
    }

    const deadline = `${deadlineDate}T${deadlineTime}:00`; // Format ISO 8601 untuk tanggal dan waktu
    const data = loadFromLocalStorage('todoData');
    data.push({ task: input.value.trim(), deadline, priority: '' });
    updatePriorities(data); // Perbarui prioritas berdasarkan tenggat waktu
    saveToLocalStorage('todoData', data); // Simpan ke localStorage
    renderTable(data); // Render tabel ulang
    input.value = ''; // Kosongkan input
    document.getElementById('deadline-date').value = '';
    document.getElementById('deadline-time').value = '';
});

// Event listener untuk pencarian
document.getElementById('search-task').addEventListener('input', (e) => {
    const search = e.target.value;
    const data = loadFromLocalStorage('todoData');
    updatePriorities(data); // Perbarui prioritas
    renderTable(data, search); // Render ulang tabel berdasarkan hasil pencarian
});

// Fungsi untuk memperbarui waktu tersisa setiap detik
function updateTimeRemaining(data) {
    setInterval(() => {
        const search = document.getElementById('search-task').value; // Gunakan hasil pencarian
        const filteredData = data.filter(item =>
            item.task.toLowerCase().includes(search.toLowerCase())
        );
        updateTimeRemainingCells(filteredData); // Perbarui kolom waktu tersisa
    }, 1000);
}

// Saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const data = loadFromLocalStorage('todoData');
    updatePriorities(data); // Perbarui prioritas berdasarkan tenggat waktu
    renderTable(data); // Render tabel awal
    updateTimeRemaining(data); // Perbarui waktu tersisa secara berkala
});

// Event listener untuk tombol "Riwayat Tugas"
document.getElementById('view-history').addEventListener('click', () => {
    document.getElementById('app').style.display = 'none'; // Sembunyikan halaman utama
    document.getElementById('history-page').style.display = 'block'; // Tampilkan halaman riwayat
    renderHistory(); // Render riwayat tugas
});

// Event listener untuk tombol "Kembali" di halaman Riwayat Tugas
document.getElementById('back-to-app').addEventListener('click', () => {
    document.getElementById('history-page').style.display = 'none'; // Sembunyikan halaman riwayat
    document.getElementById('app').style.display = 'block'; // Tampilkan halaman utama
});
