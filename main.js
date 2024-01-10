// Variables and constants
let isLoggedIn = false;
const ns = "http://www.w3.org/2000/svg";

// Helper functions
const getElement = id => document.getElementById(id);
const isInputEmpty = input => input.value === '';
const clearInput = input => { input.value = '' };
const toggleVisibility = (element, isVisible) => {
    element.style.display = isVisible ? 'none' : 'flex';
};
const removeElement = (parent, childSelector) => {
    const child = parent.querySelector(childSelector);
    if (child) parent.removeChild(child);
};

// Authentication functions
const checkLogin = () => {
    const email = getElement('login-email');
    const password = getElement('login-password');
    return !isInputEmpty(email) && !isInputEmpty(password);
};

const login = () => {
    isLoggedIn = true;
    clearInput(getElement('login-email'));
    clearInput(getElement('login-password'));
    updateUI();
};

const logout = () => {
    isLoggedIn = false;
    updateUI();
};

const updateUI = () => {
    const loginContainer = getElement('login-container');
    toggleVisibility(loginContainer, isLoggedIn);
    if (!isLoggedIn) {
        const body = document.querySelector('body');
        const main = document.querySelector('main');
        if (main) {
            body.removeChild(main);
        }
        localStorage.removeItem('jwt_token');
    }
};

// UI Display Functions
function displayProfileInfo(id, username, attributes) {
    // Implementation of displayProfileInfo
    const profileInfoContainer = document.createElement('article');
    const infoMsg = document.createElement('h1');
    infoMsg.innerText = "Student's info";
    profileInfoContainer.appendChild(infoMsg);
    const userInfoWrapper = document.createElement('ul');
    const uId = document.createElement('li');
    uId.innerText = `Student id: ${id}`;
    userInfoWrapper.appendChild(uId);
    const uName = document.createElement('li');
    uName.innerText = `Username: ${username}`;
    userInfoWrapper.appendChild(uName);

    for (const [key, value] of Object.entries(attributes)) {
        let listItem = document.createElement('li');
        listItem.innerText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        userInfoWrapper.appendChild(listItem);
    }

    profileInfoContainer.appendChild(userInfoWrapper);
    profileInfoContainer.classList.add('userInfo');
    return profileInfoContainer;
}

function displayAuditRatio(auditXpDown, auditXpUp) {
    // Implementation of displayAuditRatio
    const wrapper = document.createElement('article');
    wrapper.classList.add('auditRatio');
    const ratio = Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(auditXpUp / auditXpDown);
    const heading = document.createElement('h1');
    heading.innerText = 'Audits ratio';
    wrapper.appendChild(heading);

    const doneGraph = document.createElementNS(ns, 'svg');
    const receivedGraph = document.createElementNS(ns, 'svg');
    doneGraph.setAttribute('viewBox', '0 0 100 10');
    receivedGraph.setAttribute('viewBox', '0 0 100 10');

    const doneRect = document.createElementNS(ns, 'rect');
    const receivedRect = document.createElementNS(ns, 'rect');
    doneRect.setAttribute('height', '5');
    receivedRect.setAttribute('height', '5');
    doneRect.setAttribute('fill', '#c5dbc4');
    receivedRect.setAttribute('fill', 'rgb(207, 139, 163)');

    if ((ratio - 1) > 0) {
        doneRect.setAttribute('width', '100');
        let less = 100 - 100 * (ratio - 1);
        receivedRect.setAttribute('width', `${less}`);
    } else if ((ratio - 1 < 0)) {
        receivedRect.setAttribute('width', '100');
        let less = 100 - 100 * (1 - ratio);
        doneRect.setAttribute('width', `${less}`);
    } else {
        doneRect.setAttribute('width', '100');
        receivedRect.setAttribute('width', '100');
    }

    doneGraph.appendChild(doneRect);
    receivedGraph.appendChild(receivedRect);

    const done = document.createElement('p');
    done.innerText = `Done ${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(auditXpUp)}`;
    wrapper.appendChild(done);
    wrapper.appendChild(doneGraph);

    const received = document.createElement('p');
    received.innerText = `Received ${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(auditXpDown)}`;
    wrapper.appendChild(received);
    wrapper.appendChild(receivedGraph);

    const displayRatio = document.createElement('p');
    displayRatio.innerText = `Your audit ratio: ${ratio}`;
    wrapper.appendChild(displayRatio);

    return wrapper;
}

function displayStudentSkills(data) {
    const wrapper = document.createElement('article');
    const heading = document.createElement('h1');
    heading.innerText = 'Your Skills';
    wrapper.appendChild(heading);

    let skills = [];
    let skillNames = new Set();
    let skillProgress = new Map();

    // Store transactions related to skills and names of skills
    for (const [key, value] of Object.entries(data.transactions)) {
        if (value.type.includes('skill')) {
            skills.push(value);
            skillNames.add(value.type.split('skill_')[1]);
        }
    }

    // Save only highest values in respective skills
    for (const [key, value] of Object.entries(skills)) {
        const skillName = value.type.split('skill_')[1];
        const skillProgression = value.amount;
        if (skillNames.has(skillName)) {
            if (skillProgress.has(skillName) && skillProgress.get(skillName) < skillProgression) {
                skillProgress.set(skillName, skillProgression);
            } else if (!skillProgress.has(skillName)) {
                skillProgress.set(skillName, skillProgression);
            }
        }
    }

    // Creating a skills visualization
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('style', 'overflow: visible');

    skillNames = Array.from(skillNames);

    skillNames.forEach((skill, index) => {
        const progress = skillProgress.get(skill);
        const angle = (index / skillNames.length) * 2 * Math.PI;
        const x = 100 + 80 * Math.cos(angle);
        const y = 100 + 80 * Math.sin(angle);

        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '100');
        line.setAttribute('y1', '100');
        line.setAttribute('x2', x.toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', 'black');
        svg.appendChild(line);

        const skillText = document.createElementNS(ns, 'text');
        skillText.setAttribute('x', x.toString());
        skillText.setAttribute('y', y.toString());
        skillText.setAttribute('text-anchor', 'middle');
        skillText.textContent = `${skill} (${progress}%)`;
        svg.appendChild(skillText);
    });

    wrapper.appendChild(svg);
    wrapper.classList.add('skills');
    return wrapper;
}

function displayXpByProject(transactions) {
    const wrapper = document.createElement('article');

    const title = document.createElement('h1');
    title.textContent = 'XP by Project';
    wrapper.appendChild(title);

    let projectTransactions = [];
    let userXp = 0;

    for (const value of Object.values(transactions)) {
        if (value.type === 'xp' && !value.path.includes('piscine')) {
            projectTransactions.push(value);
            userXp += value.amount;
        }
    }

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');

    let y = 0;
    let height = 200 / projectTransactions.length;

    projectTransactions.forEach((transaction, index) => {
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', '200');
        rect.setAttribute('height', height.toString());
        rect.setAttribute('fill', `rgba(${index * 10}, ${100 + index * 10}, ${200 - index * 10})`);
        svg.appendChild(rect);
        y += height;
    });

    wrapper.appendChild(svg);

    const xpInfo = document.createElement('p');
    xpInfo.textContent = `Total User XP: ${userXp}`;
    wrapper.appendChild(xpInfo);

    wrapper.classList.add('xp');
    return wrapper;
}

function displayWelcomeMsg(username) {
    // Implementation of displayWelcomeMsg
    const wrapper = document.createElement('article');
    wrapper.classList.add('welcome');
    const welcomeMsg = document.createElement('h1');
    welcomeMsg.innerText = `Hello, ${username}!`;
    wrapper.appendChild(welcomeMsg);
    const logoutBtn = document.createElement('button');
    logoutBtn.innerText = 'Logout';
    logoutBtn.addEventListener('click', logout);
    wrapper.appendChild(logoutBtn);
    return wrapper;
}

// Add the code to display user data here
function displayUserData(user) {
    const body = document.querySelector('body');
    const main = document.createElement('main');
    main.appendChild(displayProfileInfo(user.id, user.login, user.attrs));
    main.appendChild(displayAuditRatio(user.totalDown, user.totalUp));
    main.appendChild(displayStudentSkills(user));
    main.appendChild(displayXpByProject(user.transactions));
    body.appendChild(main);
    body.appendChild(displayWelcomeMsg(user.login));
}

// Fetching and displaying user data
const fetchServerData = async() => {
    const query = `
                    query {
                        user {
                            id
                            login
                            attrs
                            totalUp
                            totalDown
                            createdAt
                            updatedAt
                            transactions(order_by: { createdAt: asc }) {
                                id
                                userId
                                type
                                amount
                                createdAt
                                path
                            }
                        }
                    }`;

    await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({ query })
    }).then(response => {
        if (!response.ok) {
            console.log('query problem', response);
        } else {
            return response.json();
        }
    }).then(data => {
        console.log(data);
        if (data && data.data && data.data.user) {
            displayUserData(data.data.user[0]);
        }
    }).catch(error => {
        console.log(error);
    })
};

document.getElementById('login-submit').addEventListener('click', async(e) => {
            e.preventDefault();
            if (checkLogin()) {
                try {
                    const response = await fetch('https://01.kood.tech/api/auth/signin', {
                                method: 'POST',
                                headers: {
                                    Authorization: `Basic ${btoa(`${getElement('login-email').value}:${getElement('login-password').value}`)}`
                }
            });
            if (response.status !== 200) {
                throw new Error('Trouble logging in. Please try again.');
            }
            const token = await response.json();
            login();
            localStorage.setItem('jwt_token', token);
            fetchServerData();
        } catch (error) {
            alert(error.message);
        }
    } else {
        alert('Invalid login credentials. Please try logging again.');
    }
});