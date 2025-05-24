 document.addEventListener('DOMContentLoaded', () => {
            const foldersContainer = document.getElementById('folders-container');
            const photosContainer = document.getElementById('photos-container');
            const backBtn = document.getElementById('back-btn');
            const newAlbumBtn = document.getElementById('new-album-btn');
            const newAlbumModal = document.getElementById('new-album-modal');
            const albumNameInput = document.getElementById('album-name');
            const createAlbumBtn = document.getElementById('create-album-btn');
            const cancelAlbumBtn = document.getElementById('cancel-album-btn');
            const addPhotoModal = document.getElementById('add-photo-modal');
            const photoUrlInput = document.getElementById('photo-url');
            const photoCaptionInput = document.getElementById('photo-caption');
            const addPhotoBtn = document.getElementById('add-photo-btn');
            const cancelPhotoBtn = document.getElementById('cancel-photo-btn');
            const editPhotoModal = document.getElementById('edit-photo-modal');
            const editPhotoUrlInput = document.getElementById('edit-photo-url');
            const editPhotoCaptionInput = document.getElementById('edit-photo-caption');
            const savePhotoBtn = document.getElementById('save-photo-btn');
            const deletePhotoBtn = document.getElementById('delete-photo-btn');
            const themeBtn = document.getElementById('theme-btn');

            let albums = JSON.parse(localStorage.getItem('albums')) || [];
            let currentAlbumIndex = -1;
            let currentPhotoIndex = -1;

            renderAlbums();

            newAlbumBtn.addEventListener('click', () => {
                albumNameInput.value = '';
                newAlbumModal.classList.add('active');
            });

            cancelAlbumBtn.addEventListener('click', () => {
                newAlbumModal.classList.remove('active');
            });

            createAlbumBtn.addEventListener('click', createAlbum);

            cancelPhotoBtn.addEventListener('click', () => {
                addPhotoModal.classList.remove('active');
            });

            addPhotoBtn.addEventListener('click', addPhoto);

            savePhotoBtn.addEventListener('click', savePhoto);

            deletePhotoBtn.addEventListener('click', deletePhoto);

            backBtn.addEventListener('click', backToAlbums);

            themeBtn.addEventListener('click', toggleTheme);

            function renderAlbums() {
                foldersContainer.innerHTML = '';
                
                if (albums.length === 0) {
                    foldersContainer.innerHTML = '<p>No albums yet. Create your first album!</p>';
                    return;
                }

                albums.forEach((album, index) => {
                    const folderEl = document.createElement('div');
                    folderEl.className = 'folder';
                    folderEl.innerHTML = `
                        <div class="folder-actions">
                            <button class="folder-action-btn" data-action="add-photo" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="folder-action-btn" data-action="edit-album" data-index="${index}">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="folder-action-btn" data-action="delete-album" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="folder-icon">
                            <div class="folder-back"></div>
                            <div class="folder-front">
                                <i class="fas fa-folder"></i>
                            </div>
                        </div>
                        <div class="folder-name">${album.name}</div>
                        <div class="folder-count">${album.photos.length} photos</div>
                    `;
                    
                    folderEl.addEventListener('click', (e) => {
                        if (!e.target.closest('.folder-action-btn')) {
                            openAlbum(index);
                        }
                    });

                    folderEl.querySelectorAll('.folder-action-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const action = btn.getAttribute('data-action');
                            const index = btn.getAttribute('data-index');
                            
                            if (action === 'add-photo') {
                                currentAlbumIndex = index;
                                photoUrlInput.value = '';
                                photoCaptionInput.value = '';
                                addPhotoModal.classList.add('active');
                            } else if (action === 'edit-album') {
                                editAlbum(index);
                            }
                            else if (action ==='delete-album'){
                                deleteAlbum(index);
                            }
                        });
                    });

                    foldersContainer.appendChild(folderEl);
                });
            }

            function openAlbum(index) {
                currentAlbumIndex = index;
                const album = albums[index];
                
                foldersContainer.style.display = 'none';
                photosContainer.style.display = 'grid';
                backBtn.style.display = 'flex';
                
                renderPhotos();
            }

            function renderPhotos() {
                photosContainer.innerHTML = '';
                const album = albums[currentAlbumIndex];
                
                if (album.photos.length === 0) {
                    photosContainer.innerHTML = '<p>No photos in this album yet.</p>';
                    return;
                }

                album.photos.forEach((photo, index) => {
                    const photoEl = document.createElement('div');
                    photoEl.className = 'photo';
                    photoEl.innerHTML = `
                        <img src="${photo.url}" alt="${photo.caption}">
                        <div class="photo-actions">
                            <button class="photo-action-btn" data-action="edit" data-index="${index}">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="photo-action-btn" data-action="delete" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    photoEl.addEventListener('click', (e) => {
                        if (!e.target.closest('.photo-action-btn')) {
                            viewPhoto(index);
                        }
                    });

                    photoEl.querySelectorAll('.photo-action-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const action = btn.getAttribute('data-action');
                            const index = btn.getAttribute('data-index');
                            
                            if (action === 'edit') {
                                editPhoto(index);
                            } else if (action === 'delete') {
                                deletePhoto(index);
                            }
                        });
                    });

                    photosContainer.appendChild(photoEl);
                });
            }

            function createAlbum() {
                const name = albumNameInput.value.trim();
                if (name) {
                    albums.push({
                        name: name,
                        photos: []
                    });
                    saveToLocalStorage();
                    renderAlbums();
                    newAlbumModal.classList.remove('active');
                }
            }
            function deleteAlbum(index) {
                if (confirm(`Are you sure you want to delete the album "${albums[index].name}"?`)) {
                albums.splice(index, 1);
                saveToLocalStorage();
                renderAlbums();
                }
            }

            function editAlbum(index) {
                const newName = prompt('Enter new album name:', albums[index].name);
                if (newName && newName.trim()) {
                    albums[index].name = newName.trim();
                    saveToLocalStorage();
                    renderAlbums();
                }
            }

            function addPhoto() {
                const url = photoUrlInput.value.trim();
                const caption = photoCaptionInput.value.trim();
                
                if (url) {
                    albums[currentAlbumIndex].photos.push({
                        url: url,
                        caption: caption || 'Untitled'
                    });
                    saveToLocalStorage();
                    renderPhotos();
                    addPhotoModal.classList.remove('active');
                }
            }

            function editPhoto(index) {
                currentPhotoIndex = index;
                const photo = albums[currentAlbumIndex].photos[index];
                editPhotoUrlInput.value = photo.url;
                editPhotoCaptionInput.value = photo.caption;
                editPhotoModal.classList.add('active');
            }

            function savePhoto() {
                const url = editPhotoUrlInput.value.trim();
                const caption = editPhotoCaptionInput.value.trim();
                
                if (url) {
                    albums[currentAlbumIndex].photos[currentPhotoIndex] = {
                        url: url,
                        caption: caption || 'Untitled'
                    };
                    saveToLocalStorage();
                    renderPhotos();
                    editPhotoModal.classList.remove('active');
                }
            }

            function deletePhoto() {
                if (confirm('Are you sure you want to delete this photo?')) {
                    albums[currentAlbumIndex].photos.splice(currentPhotoIndex, 1);
                    saveToLocalStorage();
                    renderPhotos();
                    editPhotoModal.classList.remove('active');
                }
            }

            function viewPhoto(index) {
                const photo = albums[currentAlbumIndex].photos[index];
                alert(`Viewing: ${photo.caption}\nURL: ${photo.url}`);
            }

            function backToAlbums() {
                foldersContainer.style.display = 'grid';
                photosContainer.style.display = 'none';
                backBtn.style.display = 'none';
                renderAlbums();
            }

            function toggleTheme() {
                document.body.classList.toggle('dark-mode');
                themeBtn.innerHTML = document.body.classList.contains('dark-mode') 
                    ? '<i class="fas fa-sun"></i> Light Mode' 
                    : '<i class="fas fa-moon"></i> Dark Mode';
            }

            function saveToLocalStorage() {
                localStorage.setItem('albums', JSON.stringify(albums));
            }
        });