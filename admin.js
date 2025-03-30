// Admin Panel Functionality

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initAdminDashboard();
    
    // Load events for admin management
    loadAdminEvents();
    
    // Load media library
    loadMediaLibrary();
    
    // Add event form submission
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', handleAddEvent);
    }
    
    // Media upload form submission
    const mediaUploadForm = document.getElementById('mediaUploadForm');
    if (mediaUploadForm) {
        mediaUploadForm.addEventListener('submit', handleMediaUpload);
    }
    
    // Image preview for event images
    const eventImagesInput = document.getElementById('eventImages');
    if (eventImagesInput) {
        eventImagesInput.addEventListener('change', handleImagePreview);
    }
    
    // Video preview for event videos
    const eventVideosInput = document.getElementById('eventVideos');
    if (eventVideosInput) {
        eventVideosInput.addEventListener('change', handleVideoPreview);
    }
    
    // Settings form submission
    const settingsForm = document.getElementById('adminSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSave);
    }
    
    // Initialize admin stats
    updateAdminStats();
});

// Initialize admin dashboard
function initAdminDashboard() {
    // Set admin username
    const adminUsername = localStorage.getItem('adminUsername');
    if (adminUsername && document.getElementById('adminUsername')) {
        document.getElementById('adminUsername').textContent = adminUsername;
        document.getElementById('adminUsername').value = adminUsername;
    }
    
    // Set current date in date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.value = today;
        input.min = '2000-01-01';
        input.max = '2100-12-31';
    });
}

// Load events for admin management
function loadAdminEvents(filteredEvents = events) {
    const eventsTable = document.getElementById('adminEventsTable');
    if (!eventsTable) return;
    
    eventsTable.innerHTML = filteredEvents.map(event => `
        <tr data-id="${event.id}">
            <td>${event.title}</td>
            <td>${formatDate(event.date)}</td>
            <td>${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</td>
            <td>${event.featured ? '<i class="fas fa-check" style="color: var(--success-color);"></i>' : '<i class="fas fa-times" style="color: var(--danger-color);"></i>'}</td>
            <td>${event.views}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${event.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete-btn" data-id="${event.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = parseInt(btn.getAttribute('data-id'));
            const event = events.find(ev => ev.id === eventId);
            if (event) {
                showEditEventModal(event);
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = parseInt(btn.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(eventId);
            }
        });
    });
    
    // Add click event to table rows
    document.querySelectorAll('#adminEventsTable tr').forEach(row => {
        row.addEventListener('click', () => {
            const eventId = parseInt(row.getAttribute('data-id'));
            const event = events.find(ev => ev.id === eventId);
            if (event) {
                showEventModal(event);
            }
        });
    });
}

// Update admin dashboard stats
function updateAdminStats() {
    // Total events
    document.getElementById('totalEvents').textContent = events.length;
    
    // Events this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
    document.getElementById('monthEvents').textContent = monthEvents.length;
    
    // Upcoming events
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter(event => event.date >= today);
    document.getElementById('upcomingEvents').textContent = upcomingEvents.length;
    
    // Media files count (count all images and videos from all events)
    let mediaCount = 0;
    events.forEach(event => {
        mediaCount += event.images.length + event.videos.length;
    });
    document.getElementById('mediaFiles').textContent = mediaCount;
    
    // Recent events table
    const recentEventsTable = document.getElementById('recentEventsTable');
    if (recentEventsTable) {
        // Sort events by date (newest first) and take first 5
        const recentEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        recentEventsTable.innerHTML = recentEvents.map(event => `
            <tr data-id="${event.id}">
                <td>${event.title}</td>
                <td>${formatDate(event.date)}</td>
                <td>${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</td>
                <td>${event.views}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${event.id}"><i class="fas fa-eye"></i> View</button>
                </td>
            </tr>
        `).join('');
        
        // Add click event to view buttons
        document.querySelectorAll('#recentEventsTable .view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(btn.getAttribute('data-id'));
                const event = events.find(ev => ev.id === eventId);
                if (event) {
                    showEventModal(event);
                }
            });
        });
        
        // Add click event to table rows
        document.querySelectorAll('#recentEventsTable tr').forEach(row => {
            row.addEventListener('click', () => {
                const eventId = parseInt(row.getAttribute('data-id'));
                const event = events.find(ev => ev.id === eventId);
                if (event) {
                    showEventModal(event);
                }
            });
        });
    }
}

// Handle add event form submission
function handleAddEvent(e) {
    e.preventDefault();
    
    const errorElement = document.getElementById('eventFormError');
    const successElement = document.getElementById('eventFormSuccess');
    
    // Get form values
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventCategory = document.getElementById('eventCategory').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const featuredEvent = document.getElementById('featuredEvent').checked;
    
    // Simple validation
    if (!eventName || !eventDate || !eventCategory || !eventLocation || !eventDescription) {
        errorElement.textContent = 'Please fill in all required fields.';
        return;
    }
    
    // Get image and video files
    const imageFiles = document.getElementById('eventImages').files;
    const videoFiles = document.getElementById('eventVideos').files;
    
    // In a real app, you would upload these files to a server
    // For this demo, we'll just store the filenames
    const images = [];
    const videos = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
        images.push(imageFiles[i].name);
    }
    
    for (let i = 0; i < videoFiles.length; i++) {
        videos.push(videoFiles[i].name);
    }
    
    // Create new event object
    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title: eventName,
        date: eventDate,
        category: eventCategory,
        location: eventLocation,
        description: eventDescription,
        images: images,
        videos: videos,
        featured: featuredEvent,
        views: 0
    };
    
    // Add to events array (in a real app, this would be sent to a server)
    events.push(newEvent);
    
    // Show success message
    successElement.textContent = 'Event added successfully!';
    errorElement.textContent = '';
    
    // Reset form
    e.target.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('videoPreview').innerHTML = '';
    
    // Update admin dashboard
    updateAdminStats();
    loadAdminEvents();
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successElement.textContent = '';
    }, 3000);
}

// Handle image preview for event images
function handleImagePreview(e) {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.match('image.*')) {
            continue;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="remove-preview" data-index="${i}">&times;</div>
            `;
            previewContainer.appendChild(previewItem);
            
            // Add click event to remove button
            previewItem.querySelector('.remove-preview').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFileFromInput('eventImages', parseInt(e.target.getAttribute('data-index')));
                previewItem.remove();
            });
        };
        
        reader.readAsDataURL(file);
    }
}

// Handle video preview for event videos
function handleVideoPreview(e) {
    const previewContainer = document.getElementById('videoPreview');
    previewContainer.innerHTML = '';
    
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.match('video.*')) {
            continue;
        }
        
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.style.width = '100%';
        
        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-preview';
        removeBtn.setAttribute('data-index', i);
        removeBtn.innerHTML = '&times;';
        
        previewItem.appendChild(video);
        previewItem.appendChild(removeBtn);
        previewContainer.appendChild(previewItem);
        
        // Add click event to remove button
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFileFromInput('eventVideos', parseInt(e.target.getAttribute('data-index')));
            previewItem.remove();
        });
    }
}

// Remove file from input
function removeFileFromInput(inputId, index) {
    const input = document.getElementById(inputId);
    const files = Array.from(input.files);
    files.splice(index, 1);
    
    // Create new DataTransfer object and set files
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    
    // Assign new files to input
    input.files = dataTransfer.files;
}

// Show edit event modal
function showEditEventModal(event) {
    const modal = document.getElementById('editEventModal');
    const modalBody = document.getElementById('editEventBody');
    
    if (!modal || !modalBody) return;
    
    modalBody.innerHTML = `
        <h2>Edit Event</h2>
        <form id="editEventForm">
            <input type="hidden" id="editEventId" value="${event.id}">
            <div class="form-row">
                <div class="form-group">
                    <label for="editEventName">Event Name</label>
                    <input type="text" id="editEventName" value="${event.title}" required>
                </div>
                <div class="form-group">
                    <label for="editEventDate">Event Date</label>
                    <input type="date" id="editEventDate" value="${event.date}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editEventCategory">Category</label>
                    <select id="editEventCategory" required>
                        <option value="technical" ${event.category === 'technical' ? 'selected' : ''}>Technical</option>
                        <option value="cultural" ${event.category === 'cultural' ? 'selected' : ''}>Cultural</option>
                        <option value="sports" ${event.category === 'sports' ? 'selected' : ''}>Sports</option>
                        <option value="workshops" ${event.category === 'workshops' ? 'selected' : ''}>Workshops</option>
                        <option value="seminars" ${event.category === 'seminars' ? 'selected' : ''}>Seminars</option>
                        <option value="others" ${event.category === 'others' ? 'selected' : ''}>Others</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editEventLocation">Location</label>
                    <input type="text" id="editEventLocation" value="${event.location}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="editEventDescription">Description</label>
                <textarea id="editEventDescription" rows="5" required>${event.description}</textarea>
            </div>
            <div class="form-group">
                <label for="editFeaturedEvent">Featured Event</label>
                <input type="checkbox" id="editFeaturedEvent" ${event.featured ? 'checked' : ''}>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn">Save Changes</button>
                <button type="button" id="cancelEdit" class="btn cancel-btn">Cancel</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Add form submission handler
    const editForm = document.getElementById('editEventForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditEvent);
    }
    
    // Add cancel button handler
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

// Handle edit event form submission
function handleEditEvent(e) {
    e.preventDefault();
    
    // Get form values
    const eventId = parseInt(document.getElementById('editEventId').value);
    const eventName = document.getElementById('editEventName').value;
    const eventDate = document.getElementById('editEventDate').value;
    const eventCategory = document.getElementById('editEventCategory').value;
    const eventLocation = document.getElementById('editEventLocation').value;
    const eventDescription = document.getElementById('editEventDescription').value;
    const featuredEvent = document.getElementById('editFeaturedEvent').checked;
    
    // Find event in array
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    // Update event
    events[eventIndex] = {
        ...events[eventIndex],
        title: eventName,
        date: eventDate,
        category: eventCategory,
        location: eventLocation,
        description: eventDescription,
        featured: featuredEvent
    };
    
    // Close modal
    document.getElementById('editEventModal').style.display = 'none';
    
    // Update admin dashboard
    updateAdminStats();
    loadAdminEvents();
}

// Delete event
function deleteEvent(eventId) {
    // Find event in array
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    // Remove event from array (in a real app, this would be sent to a server)
    events.splice(eventIndex, 1);
    
    // Update admin dashboard
    updateAdminStats();
    loadAdminEvents();
}

// Load media library
function loadMediaLibrary() {
    const mediaGrid = document.getElementById('mediaGrid');
    if (!mediaGrid) return;
    
    // Collect all media from all events
    let allMedia = [];
    
    events.forEach(event => {
        event.images.forEach(image => {
            allMedia.push({
                type: 'image',
                src: `assets/images/${image}`,
                eventId: event.id,
                eventTitle: event.title
            });
        });
        
        event.videos.forEach(video => {
            allMedia.push({
                type: 'video',
                src: `assets/uploads/${video}`,
                eventId: event.id,
                eventTitle: event.title
            });
        });
    });
    
    // Display media
    mediaGrid.innerHTML = allMedia.map(media => `
        <div class="media-item" data-type="${media.type}">
            ${media.type === 'image' ? 
                `<img src="${media.src}" alt="${media.eventTitle}">` : 
                `<video><source src="${media.src}" type="video/mp4"></video>`}
            <div class="media-item-overlay">
                <div class="media-item-actions">
                    <div class="media-item-btn view-btn" data-src="${media.src}">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="media-item-btn delete-btn" data-src="${media.src}">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </div>
            <div class="media-item-info">
                <small>From: ${media.eventTitle}</small>
            </div>
        </div>
    `).join('');
    
    // Add click event to view buttons
    document.querySelectorAll('.media-item .view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const src = btn.getAttribute('data-src');
            window.open(src, '_blank');
        });
    });
    
    // Add click event to delete buttons
    document.querySelectorAll('.media-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const src = btn.getAttribute('data-src');
            if (confirm('Are you sure you want to delete this media file?')) {
                // In a real app, you would send a request to the server to delete the file
                // For this demo, we'll just remove it from the DOM
                btn.closest('.media-item').remove();
            }
        });
    });
    
    // Add filter functionality
    document.querySelectorAll('.media-filter button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.media-filter button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-type');
            document.querySelectorAll('.media-item').forEach(item => {
                if (type === 'all' || item.getAttribute('data-type') === type) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Add search functionality
    const mediaSearchInput = document.getElementById('mediaSearchInput');
    if (mediaSearchInput) {
        mediaSearchInput.addEventListener('input', debounce(() => {
            const searchTerm = mediaSearchInput.value.toLowerCase();
            document.querySelectorAll('.media-item').forEach(item => {
                const eventTitle = item.querySelector('.media-item-info small').textContent.toLowerCase();
                if (eventTitle.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }, 300));
    }
}

// Handle media upload
function handleMediaUpload(e) {
    e.preventDefault();
    
    const files = document.getElementById('mediaFiles').files;
    
    if (files.length === 0) {
        alert('Please select at least one file to upload.');
        return;
    }
    
    // In a real app, you would upload these files to a server
    // For this demo, we'll just show a success message
    alert(`${files.length} file(s) uploaded successfully!`);
    
    // Reset form
    e.target.reset();
    
    // Reload media library
    loadMediaLibrary();
}

// Handle settings save
function handleSettingsSave(e) {
    e.preventDefault();
    
    const messageElement = document.getElementById('settingsMessage');
    
    // Get form values
    const adminEmail = document.getElementById('adminEmail').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const siteTitle = document.getElementById('siteTitle').value;
    const itemsPerPage = document.getElementById('itemsPerPage').value;
    
    // Validate password change if any password field is filled
    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
            messageElement.textContent = 'Please fill in all password fields to change password.';
            messageElement.className = 'message error';
            return;
        }
        
        if (newPassword !== confirmPassword) {
            messageElement.textContent = 'New password and confirm password do not match.';
            messageElement.className = 'message error';
            return;
        }
        
        // In a real app, you would verify the current password with the server
        // For this demo, we'll just show a success message
        messageElement.textContent = 'Password changed successfully!';
        messageElement.className = 'message success';
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
    
    // Save other settings
    // In a real app, you would send these to the server
    if (siteTitle) {
        document.querySelector('.logo').textContent = siteTitle;
    }
    
    messageElement.textContent = 'Settings saved successfully!';
    messageElement.className = 'message success';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 3000);
}