 footer {
            background-color: #2E2B5F;
            color: white;
            padding: 20px 40px;
            margin-top: auto;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        footer p {
            margin: 0;
        }

        .footer-left {
            text-align: left;
        }

        .footer-right {
            text-align: right;
        }

        footer a {
            color: #5B6FD8;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

        .credits-link {
            color: white;
            text-decoration: underline;
            cursor: pointer;
            margin-left: 10px;
        }

        .credits-link:hover {
            opacity: 0.8;
        }

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: flex-start;
            padding-top: 12.5vh;
        }

        .modal-overlay.active {
            display: flex;
        }

        .credits-dialog {
            background-color: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 30px 80px;
            width: 600px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .credits-dialog h2 {
            margin: 0 0 30px 0;
            font-size: 32px;
            font-weight: bold;
            color: #000;
        }

        .credits-dialog ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .credits-dialog li {
            font-size: 18px;
            color: #000;
            margin: 5px 0;
            padding-left: 0;
        }

        .dialog-footer {
            margin-top: 30px;
            text-align: right;
        }

        .ok-button {
            background-color: #4054B5;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 35px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }

        .ok-button:hover {
            background-color: #2E2B5F;
        }
