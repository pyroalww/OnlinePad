document.addEventListener('DOMContentLoaded', function () {
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const nightModeBtn = document.getElementById('nightModeBtn');
    const unorderedListBtn = document.getElementById('unorderedListBtn');
    const orderedListBtn = document.getElementById('orderedListBtn');
    const tableBtn = document.getElementById('tableBtn');
    const imageBtn = document.getElementById('imageBtn');
    const fileBtn = document.getElementById('fileBtn');
    const tagInput = document.getElementById('tagInput');
    const tagBtn = document.getElementById('tagBtn');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportBtn');
    const reminderBtn = document.getElementById('reminderBtn');
    const showAllNotesBtn = document.getElementById('showAllNotesBtn');
    const closeAllNotesBtn = document.getElementById('closeAllNotesBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const clearLocalStorageBtn = document.getElementById('clearLocalStorageBtn');
    const saveBtn = document.getElementById('saveBtn');
    const newNoteBtn = document.getElementById('newNoteBtn');

    let nightMode = localStorage.getItem('nightMode') === 'true';
    updateNightMode();

    boldBtn.addEventListener('click', function () {
        document.execCommand('bold');
    });

    italicBtn.addEventListener('click', function () {
        document.execCommand('italic');
    });

    underlineBtn.addEventListener('click', function () {
        document.execCommand('underline');
    });

    fontFamilySelect.addEventListener('change', function () {
        const fontFamily = this.value;
        document.execCommand('fontName', false, fontFamily);
    });

    fontSizeSelect.addEventListener('change', function () {
        const fontSize = this.value;
        document.execCommand('fontSize', false, fontSize);
    });

    nightModeBtn.addEventListener('click', function () {
        nightMode = !nightMode;
        localStorage.setItem('nightMode', nightMode);
        updateNightMode();
    });

    function updateNightMode() {
        if (nightMode) {
            document.body.classList.add('night-mode');
            nightModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('night-mode');
            nightModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    unorderedListBtn.addEventListener('click', function () {
        document.execCommand('insertUnorderedList');
    });

    orderedListBtn.addEventListener('click', function () {
        document.execCommand('insertOrderedList');
    });

    tableBtn.addEventListener('click', function () {
        const table = '<table border="1"><tr><td>Row 1, Cell 1</td><td>Row 1, Cell 2</td></tr><tr><td>Row 2, Cell 1</td><td>Row 2, Cell 2</td></tr></table>';
        document.execCommand('insertHTML', false, table);
    });

    imageBtn.addEventListener('click', function () {
        fileInput.setAttribute('accept', 'image/*');
        fileInput.click();
    });

    fileBtn.addEventListener('click', function () {
        fileInput.removeAttribute('accept');
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        const files = fileInput.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const data = e.target.result;
                if (file.type.includes('image')) {
                    const img = `<img src="${data}" alt="Uploaded Image">`;
                    document.execCommand('insertHTML', false, img);
                } else {
                    const link = `<a href="${data}" download="${file.name}">${file.name}</a>`;
                    document.execCommand('insertHTML', false, link);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    tagBtn.addEventListener('click', function () {
        const tags = tagInput.value.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('');
        document.execCommand('insertHTML', false, tags);
    });

    searchInput.addEventListener('input', function () {
        const searchValue = searchInput.value.toLowerCase();
        const editorContent = document.getElementById('editor').innerText.toLowerCase();

        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            const noteContent = note.innerText.toLowerCase();
            if (noteContent.includes(searchValue)) {
                note.style.display = 'block';
            } else {
                note.style.display = 'none';
            }
        });
    });

    exportBtn.addEventListener('click', exportNotes);
    reminderBtn.addEventListener('click', addReminder);
    showAllNotesBtn.addEventListener('click', function () {
        loadAllNotes();
        document.getElementById('notesModal').style.display = 'block';
    });
    closeAllNotesBtn.addEventListener('click', closeAllNotes);
    settingsBtn.addEventListener('click', function () {
        document.getElementById('settingsModal').style.display = 'block';
        loadSettings();
    });
    closeSettingsBtn.addEventListener('click', function () {
        document.getElementById('settingsModal').style.display = 'none';
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    clearLocalStorageBtn.addEventListener('click', clearLocalStorage);
    saveBtn.addEventListener('click', saveNote);
    newNoteBtn.addEventListener('click', clearEditor);

    const archiveKey = 'archived_notes';
    const recycleBinKey = 'recycle_bin';
    const autoSaveKey = 'autosave';
    const settingsKey = 'onlinepad_settings';

    function addReminder() {
        const selectedNote = window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode;
        const reminderInput = prompt('Hatırlatıcı tarih ve saati (YYYY-MM-DD HH:MM):');
        if (reminderInput) {
            const reminderDate = new Date(reminderInput);
            const now = new Date();
            if (reminderDate > now) {
                const reminderText = `<div class="reminder">Hatırlatıcı: ${reminderInput}</div>`;
                selectedNote.innerHTML += reminderText;
            } else {
                alert('Geçerli bir tarih ve saat giriniz.');
            }
        }
    }

    function autoSave() {
        const editorContent = document.getElementById('editor').innerHTML;
        localStorage.setItem(autoSaveKey, editorContent);
        saveNote();
        loadAllNotes();
    }

    function exportNotes() {
        const notes = document.querySelectorAll('.note');
        let exportedText = '';
        notes.forEach(note => {
            exportedText += note.innerHTML + '\n\n';
        });
        const blob = new Blob([exportedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearEditor() {
        document.getElementById('editor').innerHTML = '';
    }

    function saveNote() {
        const editorContent = document.getElementById('editor').innerHTML;
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const autoSavedNote = localStorage.getItem(autoSaveKey);
        if (autoSavedNote && autoSavedNote !== editorContent) {
            notes.push(autoSavedNote);
            localStorage.removeItem(autoSaveKey);
        }
        notes.push(editorContent);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadAllNotes(); // Tüm notları menüsüne ekle
    }

    function moveToRecycleBin(index) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const recycleBin = JSON.parse(localStorage.getItem(recycleBinKey)) || [];
        const deletedNote = notes.splice(index, 1)[0];
        recycleBin.push(deletedNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem(recycleBinKey, JSON.stringify(recycleBin));
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem(settingsKey)) || {};
        document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 10000;
        document.getElementById('visibleToolbarButtons').value = settings.visibleToolbarButtons || 'bold,italic,underline';
        document.getElementById('themeColor').value = settings.themeColor || 'light';
    }

    function saveSettings() {
        const autoSaveInterval = parseInt(document.getElementById('autoSaveInterval').value);
        const visibleToolbarButtons = document.getElementById('visibleToolbarButtons').value;
        const themeColor = document.getElementById('themeColor').value;
        const settings = { autoSaveInterval, visibleToolbarButtons, themeColor };
        localStorage.setItem(settingsKey, JSON.stringify(settings));
        alert('Ayarlar kaydedildi.');
    }

    function clearLocalStorage() {
        localStorage.clear();
        alert('Local Storage temizlendi.');
    }

    function loadAutoSavedNote() {
        const autoSavedNote = localStorage.getItem(autoSaveKey);
        if (autoSavedNote) {
            document.getElementById('editor').innerHTML = autoSavedNote;
        }
    }

    // Sayfa yüklendiğinde otomatik kaydedilmiş notları ve klasörleri yükle
    loadAutoSavedNote();
    loadAllNotes();
});

// Tüm notları yükle ve menüye ekle
function loadAllNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = '';
    notes.forEach((note, index) => {
        const div = document.createElement('div');
        div.innerHTML = note;
        div.classList.add('note');
        div.setAttribute('data-index', index);
        div.innerHTML += '<button class="editBtn">Düzenle</button><button class="deleteBtn">Sil</button>';
        notesContainer.appendChild(div);
    });

    // Düzenle ve sil düğmelerine tıklama olaylarını ekle
    document.querySelectorAll('.editBtn').forEach(btn => {
        btn.addEventListener('click', function () {
            const noteIndex = parseInt(this.parentElement.getAttribute('data-index'));
            const noteContent = notes[noteIndex];
            document.getElementById('editor').innerHTML = noteContent;
            closeAllNotes();
        });
    });

    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', function () {
            const noteIndex = parseInt(this.parentElement.getAttribute('data-index'));
            moveToRecycleBin(noteIndex);
            loadAllNotes(); // Menüyü güncelle
        });
    });
}

function closeAllNotes() {
    document.getElementById('notesModal').style.display = 'none';
}
