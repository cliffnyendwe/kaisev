// 1. Open Modal Frame and set targeted tracking states
function promptShare(documentId) {
    console.log(documentId)
    const modal = document.getElementById("shareModal");
    const targetCard = document.getElementById(`doc-card-${documentId}`);
    const fileTitle = targetCard ? targetCard.querySelector('.file-title').textContent : "Selected Document";
    
    document.getElementById("modalDocId").value = documentId;
    document.getElementById("modalDocTitle").textContent = `Sharing file: "${fileTitle}"`;
    document.getElementById("userSearchInput").value = "";
    document.getElementById("shareStatusMessage").textContent = "";
    document.getElementById("searchResultsDropdown").classList.remove("show-results");

    if (modal) modal.classList.add("modal-active");
}

// 2. Shut Modal Panel frame
function closeShareModal() {
    const modal = document.getElementById("shareModal");
    if (modal) modal.classList.remove("modal-active");
}

// 3. Query the Django database in real time as the user types
function searchUsersLive() {
    const inputField = document.getElementById("userSearchInput");
    const dropdown = document.getElementById("searchResultsDropdown");
    const queryStr = inputField.value.trim();

    if (queryStr.length < 1) {
        dropdown.classList.remove("show-results");
        dropdown.innerHTML = "";
        return;
    }

    // Call our new live search API endpoint
    fetch(`/users/search/?q=${encodeURIComponent(queryStr)}`)
        .then(response => response.json())
        .then(data => {
            if (data.users.length === 0) {
                dropdown.innerHTML = '<div class="dropdown-user-row" style="color:#7F8C8D; cursor:default;">No matches discovered</div>';
                dropdown.classList.add("show-results");
                return;
            }

            // Generate row links dynamically
            let dropdownContent = "";
            data.users.forEach(user => {
                dropdownContent += `
                    <div class="dropdown-user-row" onclick="executeShareAction('${user.username}')">
                        👤 <strong>${user.username}</strong> <span style="font-size:12px; color:#7F8C8D;">(${user.full_name})</span>
                    </div>
                `;
            });

            dropdown.innerHTML = dropdownContent;
            dropdown.classList.add("show-results");
        })
        .catch(err => console.error("Live user lookup pipeline error:", err));
}

// 4. Run background save sharing relationship mutation when a row link gets selected
window.executeShareAction = function(targetUsername) {
    const docId = document.getElementById("modalDocId").value;
    const statusBox = document.getElementById("shareStatusMessage");
    const csrfToken = document.querySelector('#csrf-token-carrier input').value;

    statusBox.style.color = "#2980B9";
    statusBox.textContent = `Sharing file processing...`;

    console.log("Outbound payload:",{
          token :csrfToken ? 'FOUND' : 'MISSING',
          documentid: docId,
          target: targetUsername
    })

    fetch('/documents/share/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            'document_id': String(docId),
            'username': String(targetUsername).trim()
        })
    })
    .then(response => {
        
        if(!response.ok) {
            throw new Error(`HTTP network error! Status code: ${response.status}`)
        }
        
        return response.json()
    })
    .then(data => {
        if (data && data.status === 'success') {
            if(statusBox){
                statusBox.style.color = "#27AE60"; // Clear Success Green
                statusBox.textContent = `Success! Shared with ${targetUsername}.`;
            }
            // Auto close modal frame after a brief status visibility window pause
            setTimeout(closeShareModal, 1500);
        } else {
            if(statusBox){
                statusBox.style.color = "#C0392B"; // Clear Alert Red
                statusBox.textContent = `Error: ${data.message}`;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        statusBox.style.color = "#C0392B";
        statusBox.textContent = "Failed to communicate with sharing server endpoints.";
    });
}


// 🌟 FEATURE 1: DIRECTORY FOLDER TOGGLE LAYOUT SWITCHER
window.switchFolder = function(folderType) {
    const tabMyDrive = document.getElementById("tabMyDrive");
    const tabCompany = document.getElementById("tabCompany");
    const myDriveFiles = document.getElementById("myDriveFileSegment");
    const companyFiles = document.getElementById("companyFileSegment");
    const sidebarTitle = document.getElementById("sidebarDirectoryTitle");

    if (folderType === 'mydrive') {
        tabMyDrive.classList.add("active");
        tabCompany.classList.remove("active");
        myDriveFiles.style.display = "block";
        companyFiles.style.display = "none";
        sidebarTitle.textContent = "📁 My Drive Contents";

    } else {
        tabMyDrive.classList.remove("active");
        tabCompany.classList.add("active");
        myDriveFiles.style.display = "none";
        companyFiles.style.display = "block";
        sidebarTitle.textContent = "🏢 Company Vault Files";
    }
};

// 🌟 FEATURE 2: DYNAMIC FILE THUMBNAIL PARSER EXTENSION DETECTOR
window.assignFileThumbnails = function() {
    document.querySelectorAll(".sidebar-file-item").forEach(item => {
        const fileName = item.dataset.filename || "";
        const extension = fileName.split('.').pop().toLowerCase();
        const iconContainer = item.querySelector(".file-icon-thumb");

        if (!iconContainer) return;

        // Apply visual custom icon markers and styling tints matching file extensions
        if (extension === "pdf") {
            iconContainer.textContent = "📕";
            iconContainer.className = "file-icon-thumb pdf-style";
        } else if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
            iconContainer.textContent = "🖼️";
            iconContainer.className = "file-icon-thumb image-style";
        } else if (["xls", "xlsx", "csv", "ods"].includes(extension)) {
            iconContainer.textContent = "📈";
            iconContainer.className = "file-icon-thumb spreadsheet-style";
        } else if (["doc", "docx", "txt", "md", "pdf"].includes(extension) == false && ["doc", "docx", "txt", "md"].includes(extension)) {
            iconContainer.textContent = "📘";
            iconContainer.className = "file-icon-thumb doc-style";
        }
        // Generated billing sheets keep their pre-baked 🧾 thumbnail style configurations natively
    });
};

function prependFileToSidebar(title, url, dateStr) {
    // 1. Force route execution to switch to 'My Drive' view tab if they uploaded while viewing 'Company'
    if (typeof window.switchFolder === 'function') {
        window.switchFolder('mydrive');
    }

    const targetSegment = document.getElementById("myDriveFileSegment");
    const emptyState = document.getElementById("emptyStateMyDrive");
    
    // Clear out empty state placeholders instantly
    if (emptyState) emptyState.remove();

    // 2. Generate clean raw string template matrix rows containing full data bindings
    const itemHtml = `
        <div class="sidebar-file-item" id="doc-card-new" data-filename="${url}">
            <div class="file-icon-thumb">📄</div>
            <div class="file-meta">
                <span class="file-title"><strong>${title}</strong></span>
                <span class="file-date">${dateStr}</span>
            </div>
            <div class="file-actions">
                <a href="${url}" target="_blank" class="file-open-btn">Open ↗</a>
            </div>
        </div>
    `;
    
    // 3. Insert row string into DOM layout at the absolute top of the listing track array
    targetSegment.insertAdjacentHTML('afterbegin', itemHtml);
    
    // 4. Fire the thumbnail filter parser to style color tags matching extensions
    if (typeof window.assignFileThumbnails === 'function') {
        window.assignFileThumbnails();
    }
    
    // 5. Instantly calculate layout length to update counter badges strings live
    const totalFiles = targetSegment.querySelectorAll('.sidebar-file-item').length;
    const badge = document.getElementById("myDriveCount");
    if (badge) {
        badge.textContent = totalFiles;
    }
}