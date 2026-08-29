// This function executes when a user picks up a card
function drag(event){
    //Save the unique HTML ID of the card being dragged
    event.dataTransfer.setData("text/plain", event.target.id);

    // Add a slight transparency visual effect while dragging
    setTimeout(() => {
        event.target.classList.add('dragging');
    },0);
}

// This allows the card to be dropped into columns by blocking browser rejection
function allowDrop(event){
    event.preventDefault();
}

//This runs when the card is released over a column container
function drop(event){
    event.preventDefault();

    //Retrieve the ID of the dragged element
    const cardId = event.dataTransfer.getData("text/plain");
    const draggedCard = document.getElementById(cardId);

    //Remove the transprency style class
    if(draggedCard){
        draggedCard.classList.remove('dragging');
    }

    //Find the nearest column dropping area,even if dropped directly on another card
    const column = event.target.closest('.kanban-column');

    if(column){
        //Targets the inner list element inside that column block
        const cardList = column.querySelector('.card-list');
        cardList.appendChild(draggedCard);

        //Console log for tracing backend status targets
        console.log(`Moved card ${cardId} to stage : ${column.dataset.stage}`);

        // Get exact names/keys to update
        const newStage = column.dataset.stage;
        const customerId = cardId.replace('customer-', '');
    
        //Fetch the secure CSRF Token value
        const csrfToken = document.querySelector('#csrf-token-carrier input').value;
    
        //Send data to Django in the background
        fetch(`/update-stage/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                'id': customerId,
                'stage': newStage
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success'){
                console.log(`Database updated successfully for ID ${customerId}`);
            } else {
                alert('Failed to update stage in database: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error', error)
        });

        //Recalculate your card counts
        updateCardCounters();
    }

}

//Reset card styles if user cancels the drag halfway through
document.addEventListener("dragend", function(event) {
    if(event.target.classList.contains('kanban-card')){
        event.target.classList.remove('dragging');
    }
});

//Updates the small counts badge inside the column headings instantly
function updateCardCounters(){
    document.querySelectorAll('.kanban-column').forEach(column => {
        const count = column.querySelectorAll ? column.querySelectorAll('.kanban-card').length : 0;
        const badge = column.querySelector('.badge');
        if(badge){
         badge.textContent = count;
        }
    });
}

document.addEventListener("DOMContentLoaded", updateCardCounters)

function toggleUserDropdown(event) {
    event.stopPropagation(); // Prevents instant global document close actions
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

// Automatically dim and hide dropdown if user clicks anywhere else on the screen canvas
document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("userDropdown");
    const avatar = document.querySelector(".user-avatar");
    
    // Safely check elements and close card panel boundaries securely
    if (dropdown && dropdown.classList.contains("show")) {
        if (!dropdown.contains(event.target) && event.target !== avatar) {
            dropdown.classList.remove("show");
        }
    }
})

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const statusIndicator = document.getElementById("uploadStatus");
    const documentFeed = document.getElementById("documentFeed");
    const emptyState = document.getElementById("emptyState");
    const docCountBadge = document.getElementById("docCount");

    if(!dropZone) return;

    //1. Let clicking anywhere inside the big dashed areaopen the system file chooser dialog box
    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => handleSelectedFiles(fileInput.files));

    // 2. Drag Intercept Event Listeners
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over-active');
        }, false);
    });

    // 3. Capture file drop release action
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleSelectedFiles(files);
    }, false);

    // 4. Process files loop array
    function handleSelectedFiles(files) {
        if (files.length === 0) return;
        
        statusIndicator.textContent = `Uploading ${files.length} file(s)...`;
        
        // Loop and upload each single dropped file to Django
        Array.from(files).forEach(file => uploadFileAJAX(file));
    }

    // 5. Send file data binary up to Django using Fetch and FormData
    function uploadFileAJAX(file) {
        const formData = new FormData();
        // Use the title name field string, stripping away file extension suffixes
        formData.append('title', file.name.split('.').slice(0, -1).join('.'));
        formData.append('uploaded_file', file);

        const csrfToken = document.querySelector('#csrf-token-carrier input').value;

        fetch('/documents/upload/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest' // Informs Django this is an AJAX call
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                statusIndicator.textContent = "Upload Complete! Check your sidebar feed.";
                setTimeout(() => statusIndicator.textContent = "", 3000);
                
                // Clear the empty state notification if this is the first file
                if (emptyState) emptyState.remove();

                // Inject the brand new row into the scrolling sidebar feed cleanly
                prependFileToSidebar(data.file_title, data.file_url, data.uploaded_at);
            } else {
                statusIndicator.textContent = `Upload failed: ${data.message}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            statusIndicator.textContent = "Server communication error encountered.";
        });
    }

    // 6. Dynamic DOM injection row layout generator
    function prependFileToSidebar(title, url, dateStr) {
        const itemHtml = `
            <div class="sidebar-file-item">
                <a href="${url}" target="_blank">
                    <div class="file-meta">
                        <span class="file-title"><strong>${title}</strong></span>
                        <span class="file-date">${dateStr}</span>
                    </div>               
                </a>
            </div>
        `;
        documentFeed.insertAdjacentHTML('afterbegin', itemHtml);
        
        // Update total counter badge string integers dynamically
        const currentCount = documentFeed.querySelectorAll('.sidebar-file-item').length;
        docCountBadge.textContent = currentCount;
    }
});

