  <footer>
        <div class="footer-left">
            <p>&copy; @DateTime.Now.Year Student Management System. All rights reserved.</p>
        </div>
        <div class="footer-right">
            <p>
                <a href="#" class="credits-link" onclick="openCreditsDialog(event)">Credits</a>
                <span style="margin: 0 15px;">|</span>
                Designed for educational purposes
            </p>
        </div>
    </footer>

    <!-- Credits Dialog -->
    <div id="creditsModal" class="modal-overlay" onclick="closeCreditsDialog(event)">
        <div class="credits-dialog" onclick="event.stopPropagation()">
            <h2>Credits</h2>
            <ul>
                <li>Elon Musk</li>
                <li>Mark Zuckerberg</li>
                <li>George Bush</li>
                <li>Vatherine Homes</li>
            </ul>
            <div class="dialog-footer">
                <button class="ok-button" onclick="closeCreditsDialog(event)">OK</button>
            </div>
        </div>
    </div>
