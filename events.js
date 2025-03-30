// Events Display Logic

// Sample events data (in a real app, this would come from a backend API)
let events = [
    {
        id: 1,
        title: "Tech Symposium 2023",
        date: "2023-05-15",
        category: "technical",
        location: "Main Auditorium",
        description: "Annual technical symposium featuring workshops, competitions, and guest lectures from industry experts.",
        images: ["tech1.jpg", "tech2.jpg", "tech3.jpg"],
        videos: ["tech-video1.mp4"],
        featured: true,
        views: 245
    },
    {
        id: 2,
        title: "Cultural Fest",
        date: "2023-03-20",
        category: "cultural",
        location: "College Grounds",
        description: "Vibrant cultural festival showcasing dance, music, art and cuisine from different regions.",
        images: ["cultural1.jpg", "cultural2.jpg"],
        videos: [],
        featured: true,
        views: 189
    },
    {
        id: 3,
        title: "Sports Day",
        date: "2023-02-10",
        category: "sports",
        location: "Sports Complex",
        description: "Annual sports day with competitions in various track and field events.",
        images: ["sports1.jpg", "sports2.jpg", "sports3.jpg"],
        videos: ["sports-video1.mp4"],
        featured: false,
        views: 132
    },
    {
        id: 4,
        title: "AI Workshop",
        date: "2023-06-05",
        category: "workshops",
        location: "Computer Lab 3",
        description: "Hands-on workshop on Artificial Intelligence and Machine Learning fundamentals.",
        images: ["workshop1.jpg", "workshop2.jpg"],
        videos: [],
        featured: false,
        views: 98
    },
    {
        id: 5,
        title: "Entrepreneurship Seminar",
        date: "2023-04-18",
        category: "seminars",
        location: "Seminar Hall",
        description: "Inspirational talks by successful entrepreneurs sharing their journey and insights.",
        images: ["seminar1.jpg"],
        videos: ["seminar-video1.mp4"],
        featured: true,
        views: 176
    },
    {
        id: 6,
        title: "Freshers' Party",
        date: "2023-08-25",
        category: "others",
        location: "Open Air Theater",
        description: "Welcome party for new students with performances and fun activities.",
        images: ["freshers1.jpg", "freshers2.jpg"],
        videos: [],
        featured: false,
        views: 210
    }
];

// Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    displayEvents();
    displayFeaturedEvents();
    
    // Event search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            const searchTerm = searchInput.value.toLowerCase();
            filterEvents(searchTerm);
        }, 300));
    }
    
    // Category filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            filterEvents();
        });
    }
    
    // Sort functionality
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            filterEvents();
        });
    }
    
    // Load more events
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreEvents);
    }
    
    // Category cards click event
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            document.getElementById('categoryFilter').value = category;
            filterEvents();
            
            // Scroll to events section if on home page
            if (window.location.pathname.endsWith('index.html')) {
                window.location.href = 'events.html';
            }
        });
    });
});

// Display featured events on home page
function displayFeaturedEvents() {
    const featuredContainer = document.getElementById('featuredEvents');
    if (!featuredContainer) return;
    
    const featuredEvents = events.filter(event => event.featured).slice(0, 3);
    
    if (featuredEvents.length === 0) {
        featuredContainer.innerHTML = '<p>No featured events available.</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredEvents.map(event => `
        <div class="event-card" data-id="${event.id}">
            <img src="assets/images/${event.images[0] || 'placeholder.jpg'}" alt="${event.title}">
            <div class="event-card-content">
                <h3>${event.title}</h3>
                <div class="event-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(event.date)}
                </div>
                <span class="event-category">${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
                <p>${event.description.substring(0, 100)}...</p>
                <a href="events.html" class="btn">View Event</a>
            </div>
        </div>
    `).join('');
    
    // Add click event to event cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking on a link inside the card
            if (e.target.tagName === 'A') return;
            
            const eventId = parseInt(card.getAttribute('data-id'));
            const event = events.find(ev => ev.id === eventId);
            if (event) {
                showEventModal(event);
            }
        });
    });
}

// Display all events on events page
function displayEvents(filteredEvents = events) {
    const eventsContainer = document.getElementById('eventsGrid');
    if (!eventsContainer) return;
    
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">No events found matching your criteria.</p>';
        return;
    }
    
    // Show only first 6 events initially
    const eventsToShow = filteredEvents.slice(0, 6);
    
    eventsContainer.innerHTML = eventsToShow.map(event => `
        <div class="event-card" data-id="${event.id}">
            <img src="assets/images/${event.images[0] || 'placeholder.jpg'}" alt="${event.title}">
            <div class="event-card-content">
                <h3>${event.title}</h3>
                <div class="event-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(event.date)}
                </div>
                <span class="event-category">${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
                <p>${event.description.substring(0, 100)}...</p>
                <button class="btn view-btn">View Details</button>
            </div>
        </div>
    `).join('');
    
    // Add click event to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.event-card');
            const eventId = parseInt(card.getAttribute('data-id'));
            const event = events.find(ev => ev.id === eventId);
            if (event) {
                showEventModal(event);
            }
        });
    });
    
    // Add click event to event cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = parseInt(card.getAttribute('data-id'));
            const event = events.find(ev => ev.id === eventId);
            if (event) {
                showEventModal(event);
            }
        });
    });
    
    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (filteredEvents.length > 6) {
            loadMoreBtn.style.display = 'block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Load more events
function loadMoreEvents() {
    const eventsContainer = document.getElementById('eventsGrid');
    const currentCount = document.querySelectorAll('#eventsGrid .event-card').length;
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortBy = document.getElementById('sortBy');
    
    let filteredEvents = filterEvents(searchInput ? searchInput.value : '', false);
    
    if (categoryFilter) {
        filteredEvents = filterByCategory(filteredEvents, categoryFilter.value);
    }
    
    if (sortBy) {
        filteredEvents = sortEvents(filteredEvents, sortBy.value);
    }
    
    const nextEvents = filteredEvents.slice(currentCount, currentCount + 6);
    
    nextEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.setAttribute('data-id', event.id);
        eventCard.innerHTML = `
            <img src="assets/images/${event.images[0] || 'placeholder.jpg'}" alt="${event.title}">
            <div class="event-card-content">
                <h3>${event.title}</h3>
                <div class="event-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(event.date)}
                </div>
                <span class="event-category">${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
                <p>${event.description.substring(0, 100)}...</p>
                <button class="btn view-btn">View Details</button>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
        
        // Add click event to view button
        const viewBtn = eventCard.querySelector('.view-btn');
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventModal(event);
        });
        
        // Add click event to card
        eventCard.addEventListener('click', () => {
            showEventModal(event);
        });
    });
    
    // Hide load more button if all events are shown
    if (currentCount + nextEvents.length >= filteredEvents.length) {
        document.getElementById('loadMoreBtn').style.display = 'none';
    }
}

// Filter events based on search term and category
function filterEvents(searchTerm = '', updateDisplay = true) {
    let filteredEvents = [...events];
    
    // Filter by search term
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
            event.title.toLowerCase().includes(searchTerm) || 
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value !== 'all') {
        filteredEvents = filterByCategory(filteredEvents, categoryFilter.value);
    }
    
    // Sort events
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        filteredEvents = sortEvents(filteredEvents, sortBy.value);
    }
    
    if (updateDisplay) {
        displayEvents(filteredEvents);
    }
    
    return filteredEvents;
}

// Filter events by category
function filterByCategory(eventsArray, category) {
    return eventsArray.filter(event => event.category === category);
}

// Sort events
function sortEvents(eventsArray, sortBy) {
    switch (sortBy) {
        case 'newest':
            return [...eventsArray].sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'oldest':
            return [...eventsArray].sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'popular':
            return [...eventsArray].sort((a, b) => b.views - a.views);
        default:
            return eventsArray;
    }
}

// Show event details in modal
function showEventModal(event) {
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    // Increment views (in a real app, this would be sent to the server)
    event.views++;
    
    modalBody.innerHTML = `
        <div class="event-details">
            <div class="event-details-content">
                <h2>${event.title}</h2>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="far fa-calendar-alt"></i>
                        ${formatDate(event.date)}
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-tag"></i>
                        ${event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-eye"></i>
                        ${event.views} views
                    </div>
                </div>
                <div class="event-description">
                    <p>${event.description}</p>
                </div>
            </div>
            <div class="event-gallery">
                <h3>Gallery</h3>
                ${event.images.length > 0 || event.videos.length > 0 ? '' : '<p>No media available for this event.</p>'}
                <div class="event-gallery-grid">
                    ${event.images.map(img => `
                        <div class="event-gallery-item">
                            <img src="assets/images/${img}" alt="${event.title}">
                        </div>
                    `).join('')}
                    ${event.videos.map(video => `
                        <div class="event-gallery-item">
                            <video controls>
                                <source src="assets/uploads/${video}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Add click event to gallery items for lightbox functionality
    document.querySelectorAll('.event-gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            // In a real app, you might want to implement a proper lightbox here
            if (item.querySelector('img')) {
                window.open(item.querySelector('img').src, '_blank');
            } else if (item.querySelector('video')) {
                const video = item.querySelector('video');
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
    });
}