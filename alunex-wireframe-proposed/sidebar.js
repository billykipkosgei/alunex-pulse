// Sidebar collapse/expand functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all section headers
    const sectionHeaders = document.querySelectorAll('.sidebar-section-header');

    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const content = this.nextElementSibling;

            if (content && content.classList.contains('sidebar-section-content')) {
                content.classList.toggle('collapsed');

                // Set max-height for animation
                if (content.classList.contains('collapsed')) {
                    content.style.maxHeight = '0px';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            }
        });
    });

    // Initialize all sections as expanded
    document.querySelectorAll('.sidebar-section-content').forEach(content => {
        if (!content.classList.contains('collapsed')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
});

// Help menu functionality
function showHelpMenu(event) {
    event.preventDefault();
    window.location.href = 'help.html';
}
