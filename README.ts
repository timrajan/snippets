<!-- 
    nav: Tells Bootstrap this is a navigation component
    navbar-nav: Styles the list for use in a navbar
-->
<ul class="nav navbar-nav">

    <!-- 
        nav-item: Marks this as a navigation item
        dropdown: Tells Bootstrap this item contains a dropdown menu
    -->
    <li class="nav-item dropdown">
    
        <!-- 
            nav-link: Styles the link for navigation
            dropdown-toggle: Adds the small inverted triangle (▼) automatically
            data-bs-toggle="dropdown": Tells Bootstrap to show/hide dropdown on click
            role="button": Accessibility - tells screen readers this acts like a button
            aria-expanded="false": Accessibility - indicates dropdown is closed
        -->
        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false">
        
            <!-- 
                Your icon (e.g., Font Awesome user icon)
                me-1: Adds a small margin to the right (end) of the icon
            -->
            <i class="fa fa-user me-1"></i>
            
            <!-- 
                The username text
            -->
            John Doe
        </a>
        
        <!-- 
            dropdown-menu: The container for the dropdown links
            This is hidden by default and shows when you click the toggle
        -->
        <ul class="dropdown-menu">
        
            <!-- 
                First dropdown link
            -->
            <li>
                <!-- 
                    dropdown-item: Styles links inside the dropdown
                    Gives proper padding, hover effects, etc.
                -->
                <a class="dropdown-item" href="/profile">
                    <i class="fa fa-user me-2"></i>
                    My Profile
                </a>
            </li>
            
            <!-- 
                Second dropdown link
            -->
            <li>
                <a class="dropdown-item" href="/settings">
                    <i class="fa fa-cog me-2"></i>
                    Settings
                </a>
            </li>
            
            <!-- 
                dropdown-divider: Creates a horizontal line separator
                Useful for grouping related items
            -->
            <li><hr class="dropdown-divider"></li>
            
            <!-- 
                Third dropdown link (e.g., logout)
            -->
            <li>
                <a class="dropdown-item" href="/logout">
                    <i class="fa fa-sign-out me-2"></i>
                    Logout
                </a>
            </li>
            
        </ul>
        
    </li>
    
</ul>
```

---

## Visual Representation

**Before clicking (closed):**
```
┌─────────────────────┐
│  👤 John Doe ▼      │   ← The triangle (▼) is added automatically
└─────────────────────┘
```

**After clicking (open):**
```
┌─────────────────────┐
│  👤 John Doe ▼      │
├─────────────────────┤
│  👤 My Profile      │   ← dropdown-item
│  ⚙️ Settings        │   ← dropdown-item
│  ─────────────────  │   ← dropdown-divider
│  🚪 Logout          │   ← dropdown-item
└─────────────────────┘
