// Configuration
const SHEET_ID = "1BRLb-61FKy611Lfa2keiqibiDcLqub5ZUIW86FTsV2E";
const SHEET_NAME = "Sheet1";
const CONTENT_SHEET = "Sheet2";
const MEMBERS_SHEET = "Sheet3";

const galleryUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
const contentUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONTENT_SHEET}`;
const membersUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${MEMBERS_SHEET}`;

// Countdown Timer
const countdownDate = new Date("Jan 11, 2026 06:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  if (distance < 0) {
    document.getElementById("countdown").innerHTML = "<p style='color: #fff; font-size: 1.5rem;'>🎉 Tour has started! 🎉</p>";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = String(days).padStart(2, '0');
  document.getElementById("hours").textContent = String(hours).padStart(2, '0');
  document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
  document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
}

// Update countdown every second
updateCountdown();
setInterval(updateCountdown, 1000);

// Navigation Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger?.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  
  // Animate hamburger
  const spans = hamburger.querySelectorAll('span');
  if (navMenu.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translateY(10px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  });
});

// Active navigation link based on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 100) {
      current = section.getAttribute('id');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});

backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Gallery Filter System
let allCards = [];
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryContainer = document.getElementById('galleryContainer');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter cards
    const filter = btn.getAttribute('data-filter');
    filterGallery(filter);
  });
});

function filterGallery(filter) {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    if (filter === 'all') {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.5s';
    } else {
      const category = card.getAttribute('data-category');
      if (category && category.toLowerCase() === filter.toLowerCase()) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.5s';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// Load Gallery from Google Sheets
function loadGallery() {
  console.log('🔄 Loading gallery from:', galleryUrl);
  console.log('📊 Expected 3 images from Sheet1');
  
  fetch(galleryUrl)
    .then(res => {
      console.log('📥 Response received, status:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('📄 Raw data length:', text.length);
      console.log('📄 First 100 chars:', text.substring(0, 100));
      
      const json = JSON.parse(text.substr(47).slice(0, -2));
      console.log('✅ JSON parsed successfully');
      console.log('📊 JSON structure:', json);
      
      const rows = json.table.rows;
      console.log('📋 Total rows found:', rows ? rows.length : 0);

      if (!rows || rows.length <= 1) {
        console.log('⚠️ No data rows found in sheet (only heading or empty)');
        galleryContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-images" style="font-size: 4rem; color: #00bcd4; margin-bottom: 20px;"></i>
            <h3 style="font-size: 1.5rem; color: #033649; margin-bottom: 10px;">No Images Yet</h3>
            <p style="color: #666;">Images will appear here once uploaded by admin</p>
            <p style="color: #999; font-size: 0.9rem; margin-top: 10px;">Check Sheet1 for data</p>
          </div>
        `;
        return;
      }

      galleryContainer.innerHTML = '';

      // Skip heading row
      const dataRows = rows.slice(1);
      console.log('📊 Data rows (after skipping heading):', dataRows.length);

      dataRows.forEach((r, index) => {
        console.log(`Processing row ${index + 1}:`, r.c);
        
        const title = r.c[0]?.v || "Untitled";
        const desc = r.c[1]?.v || "";
        const imgUrl = r.c[2]?.v || "";
        const category = r.c[3]?.v || "other";

        console.log(`Row ${index} - Title: ${title}, Image URL: "${imgUrl}", Category: ${category}`);

        if (imgUrl) {
          // Convert Google Drive URL to direct link
          let imageUrl = imgUrl;
          console.log(`🔍 Processing image for "${title}":`, imgUrl);
          if (imgUrl.includes('drive.google.com')) {
            // Extract file ID from various Google Drive URL formats
            let fileId = null;
            
            // Format 1: /file/d/FILE_ID/view
            if (imgUrl.includes('/file/d/')) {
              fileId = imgUrl.match(/\/file\/d\/([^\/]+)/)?.[1];
            }
            // Format 2: /open?id=FILE_ID
            else if (imgUrl.includes('/open?id=')) {
              fileId = imgUrl.match(/[?&]id=([^&]+)/)?.[1];
            }
            // Format 3: uc?id=FILE_ID or uc?export=view&id=FILE_ID
            else if (imgUrl.includes('uc?')) {
              fileId = imgUrl.match(/[?&]id=([^&]+)/)?.[1];
            }
            
            if (fileId) {
              // Use Google Drive thumbnail API for better compatibility
              imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
              console.log(`✅ Converted Drive URL for "${title}" - File ID: ${fileId}`);
              console.log(`   Using Drive Thumbnail URL: ${imageUrl}`);
            } else {
              console.warn(`⚠️ Could not extract file ID from: ${imgUrl}`);
            }
          }
          
          const card = document.createElement('div');
          card.className = 'card';
          card.setAttribute('data-category', category.toLowerCase());
          card.style.animationDelay = `${index * 0.1}s`;
          
          const imgElement = document.createElement('img');
          imgElement.src = imageUrl;
          imgElement.alt = title;
          imgElement.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2300bcd4" width="400" height="300"/%3E%3Ctext fill="white" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
            this.onerror = null;
          };
          
          const cardContent = document.createElement('div');
          cardContent.className = 'card-content';
          cardContent.innerHTML = `
            <h3>${title}</h3>
            <p>${desc}</p>
          `;
          
          card.appendChild(imgElement);
          card.appendChild(cardContent);

          console.log(`🖼️ Added card for "${title}" with URL:`, imageUrl);

          galleryContainer.appendChild(card);
        } else {
          console.log(`⚠️ Row ${index} skipped - no image URL`);
        }
      });

      allCards = document.querySelectorAll('.card');
      console.log(`✅ Loaded ${allCards.length} images successfully`);
    })
    .catch(error => {
      console.error('❌ Error loading gallery:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Gallery URL:', galleryUrl);
      
      galleryContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ff5722; margin-bottom: 20px;"></i>
          <h3 style="font-size: 1.5rem; color: #033649; margin-bottom: 10px;">Failed to Load Gallery</h3>
          <p style="color: #666;">Error: ${error.message}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 10px;">Check console (F12) for details</p>
          <button onclick="loadGallery()" style="margin-top: 20px; padding: 12px 30px; background: #00bcd4; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">Retry</button>
        </div>
      `;
    });
}

// Load Tour Members from Sheet3
function loadTeamMembers() {
  console.log('🔄 Loading team members from:', membersUrl);
  console.log('👥 Expected 2 members from Sheet3');
  
  const teamContainer = document.getElementById('teamContainer');
  
  fetch(membersUrl)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      if (!rows || rows.length <= 1) {
        teamContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-users" style="font-size: 4rem; color: #00bcd4; margin-bottom: 20px;"></i>
            <h3 style="font-size: 1.5rem; color: #033649; margin-bottom: 10px;">No Team Members Yet</h3>
            <p style="color: #666;">Team members will appear here once added by admin</p>
          </div>
        `;
        return;
      }

      teamContainer.innerHTML = '';

      // Skip heading row
      const dataRows = rows.slice(1);
      console.log('👥 Data rows (after skipping heading):', dataRows.length);

      dataRows.forEach((r, index) => {
        const name = r.c[0]?.v || "Unknown";
        const email = r.c[1]?.v || "";
        const phone = r.c[2]?.v || "";
        const role = r.c[3]?.v || "Member";
        const photo = r.c[4]?.v || "";

        console.log(`👤 Processing member ${index + 1}: ${name}, Email: ${email}, Role: ${role}`);

        // Always show member (don't skip any rows)
        // Convert Google Drive URL to direct link
        let photoUrl = photo;
        if (photo.includes('drive.google.com')) {
            // Extract file ID from various Google Drive URL formats
            let fileId = null;
            
            // Format 1: /file/d/FILE_ID/view
            if (photo.includes('/file/d/')) {
              fileId = photo.match(/\/file\/d\/([^\/]+)/)?.[1];
            }
            // Format 2: /open?id=FILE_ID
            else if (photo.includes('/open?id=')) {
              fileId = photo.match(/[?&]id=([^&]+)/)?.[1];
            }
            // Format 3: uc?id=FILE_ID or uc?export=view&id=FILE_ID
            else if (photo.includes('uc?')) {
              fileId = photo.match(/[?&]id=([^&]+)/)?.[1];
            }
            
            if (fileId) {
              photoUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
              console.log(`✅ Converted Drive URL for team photo: ${name} - File ID: ${fileId}`);
            }
          }

        const card = document.createElement('div');
        card.className = 'team-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const firstLetter = name.charAt(0).toUpperCase();
        const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=120&background=00bcd4&color=fff`;
        
        card.innerHTML = `
          <img src="${photoUrl}" alt="${name}" class="team-photo" onerror="this.src='${fallbackImg}'">
          <h3>${name}</h3>
          <p class="role">${role}</p>
          <div class="team-contact">
            ${email ? `<p><i class="fas fa-envelope"></i> ${email}</p>` : ''}
            ${phone ? `<p><i class="fas fa-phone"></i> ${phone}</p>` : ''}
          </div>
        `;

        teamContainer.appendChild(card);
      });

      console.log(`✅ Loaded ${dataRows.length} team members successfully`);
    })
    .catch(error => {
      console.error('❌ Error loading team members:', error);
      teamContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ff5722; margin-bottom: 20px;"></i>
          <h3 style="font-size: 1.5rem; color: #033649; margin-bottom: 10px;">Failed to Load Team</h3>
          <p style="color: #666;">Please check your internet connection and try again</p>
        </div>
      `;
    });
}

// Smooth Scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Loading Animation
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});

// Load Stats (Total Students and Memories)
function loadStats() {
  console.log('📊 Loading statistics...');
  console.log('📊 Members URL:', membersUrl);
  console.log('📊 Gallery URL:', galleryUrl);
  
  const studentElement = document.getElementById('totalStudents');
  const memoryElement = document.getElementById('totalMemories');
  
  console.log('📊 Student Element:', studentElement);
  console.log('📊 Memory Element:', memoryElement);
  
  if (!studentElement || !memoryElement) {
    console.error('❌ Elements not found!');
    return;
  }
  
  // Count total students from Sheet3
  fetch(membersUrl)
    .then(res => {
      console.log('📥 Members fetch response:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('📄 Members data received, length:', text.length);
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;
      console.log('👥 Total rows in Sheet3:', rows ? rows.length : 0);
      console.log('👥 All rows:', rows);
      // Skip heading row
      const totalStudents = rows && rows.length > 1 ? rows.length - 1 : 0;
      studentElement.textContent = totalStudents;
      console.log(`✅ Total Students (excluding heading): ${totalStudents}`);
    })
    .catch(error => {
      console.error('❌ Error loading student count:', error);
      studentElement.textContent = '0';
    });

  // Count total memories from Sheet1
  fetch(galleryUrl)
    .then(res => {
      console.log('📥 Gallery fetch response:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('📄 Gallery data received, length:', text.length);
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;
      // Skip heading row
      const totalMemories = rows && rows.length > 1 ? rows.length - 1 : 0;
      memoryElement.textContent = totalMemories;
      console.log(`✅ Total Memories (excluding heading): ${totalMemories}`);
    })
    .catch(error => {
      console.error('❌ Error loading memories count:', error);
      memoryElement.textContent = '0';
    });
}

// Load Website Content from Sheet2
function loadWebContent() {
  console.log('📄 Loading website content from Sheet2...');
  console.log('🔗 Content URL:', contentUrl);
  
  fetch(contentUrl)
    .then(res => {
      console.log('📥 Response status:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('📄 Raw data length:', text.length);
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;
      
      console.log('📊 Total rows received:', rows ? rows.length : 0);
      
      if (!rows || rows.length <= 1) {
        console.log('⚠️ No content data found in Sheet2');
        return;
      }
      
      // Skip heading row and create a map of key-value pairs
      const content = {};
      rows.slice(1).forEach((r, index) => {
        const key = r.c[0]?.v;
        const value = r.c[1]?.v;
        if (key && value) {
          content[key] = value;
          console.log(`  ${index + 1}. ${key} = ${value.substring(0, 50)}...`);
        }
      });
      
      console.log('✅ Loaded content keys:', Object.keys(content));
      
      // Update hero section
      if (content.heroTitle) {
        document.getElementById('heroTitle').textContent = content.heroTitle;
        console.log('✅ Updated heroTitle');
      }
      if (content.heroSubtitle) {
        document.getElementById('heroSubtitle').textContent = content.heroSubtitle;
        console.log('✅ Updated heroSubtitle');
      }
      if (content.heroDescription) {
        document.getElementById('heroDescription').textContent = content.heroDescription;
        console.log('✅ Updated heroDescription');
      }
      
      // Update about section
      if (content.aboutTitle) document.getElementById('aboutTitle').textContent = content.aboutTitle;
      if (content.aboutDesc) document.getElementById('aboutDesc').textContent = content.aboutDesc;
      if (content.tourDays) document.getElementById('tourDays').textContent = content.tourDays;
      
      // Update features/highlights (4 features)
      for (let i = 1; i <= 4; i++) {
        if (content[`feature${i}Icon`]) {
          const iconEl = document.getElementById(`feature${i}Icon`);
          if (iconEl) iconEl.className = content[`feature${i}Icon`];
        }
        if (content[`feature${i}Title`]) {
          const titleEl = document.getElementById(`feature${i}Title`);
          if (titleEl) titleEl.textContent = content[`feature${i}Title`];
        }
        if (content[`feature${i}Desc`]) {
          const descEl = document.getElementById(`feature${i}Desc`);
          if (descEl) descEl.textContent = content[`feature${i}Desc`];
        }
      }
      
      // Update itinerary (4 days)
      for (let i = 1; i <= 4; i++) {
        if (content[`day${i}Title`]) {
          const titleEl = document.getElementById(`day${i}Title`);
          if (titleEl) titleEl.textContent = content[`day${i}Title`];
        }
        if (content[`day${i}Subtitle`]) {
          const subtitleEl = document.getElementById(`day${i}Subtitle`);
          if (subtitleEl) subtitleEl.textContent = content[`day${i}Subtitle`];
        }
        if (content[`day${i}Schedule`]) {
          const scheduleEl = document.getElementById(`day${i}Schedule`);
          if (scheduleEl) {
            // Replace | with newlines for better formatting
            scheduleEl.textContent = content[`day${i}Schedule`].replace(/\s*\|\s*/g, '\n');
          }
        }
      }
      
      // Update rules section
      if (content.rulesTitle) document.getElementById('rulesTitle').textContent = content.rulesTitle;
      if (content.rulesDescription) document.getElementById('rulesDescription').textContent = content.rulesDescription;
      if (content.rulesHeading) document.getElementById('rulesHeading').textContent = content.rulesHeading;
      if (content.rulesContact) document.getElementById('rulesContact').textContent = content.rulesContact;
      
      for (let i = 1; i <= 5; i++) {
        if (content[`rule${i}`]) {
          const ruleEl = document.getElementById(`rule${i}`);
          if (ruleEl) ruleEl.textContent = content[`rule${i}`];
        }
      }
      
      // Update sponsor section
      if (content.sponsorTitle) document.getElementById('sponsorTitle').textContent = content.sponsorTitle;
      if (content.sponsorDescription) document.getElementById('sponsorDescription').textContent = content.sponsorDescription;
      if (content.sponsorHeading) document.getElementById('sponsorHeading').textContent = content.sponsorHeading;
      if (content.sponsorSubtitle) document.getElementById('sponsorSubtitle').textContent = content.sponsorSubtitle;
      
      // Update contact section
      if (content.contactEmail) document.getElementById('contactEmail').textContent = content.contactEmail;
      if (content.departmentName) document.getElementById('departmentName').textContent = content.departmentName;
      
      // Update social links
      if (content.facebookLink) {
        document.getElementById('facebookLink').href = content.facebookLink;
        document.getElementById('footerFacebook').href = content.facebookLink;
      }
      if (content.instagramLink) {
        document.getElementById('instagramLink').href = content.instagramLink;
        document.getElementById('footerInstagram').href = content.instagramLink;
      }
      if (content.youtubeLink) {
        document.getElementById('youtubeLink').href = content.youtubeLink;
        document.getElementById('footerYoutube').href = content.youtubeLink;
      }
      
      // Update footer
      if (content.footerText) document.getElementById('footerText').textContent = content.footerText;
      
      console.log('✅ Website content updated successfully!');
    })
    .catch(error => {
      console.error('❌ Error loading website content:', error);
    });
}

// Initialize Gallery on Page Load
document.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  loadTeamMembers();
  loadStats();
  // Sheet2 content loading removed - using hardcoded content
  
  // Add intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll('.highlight-card, .stat-card, .memory-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
});

console.log('🌊 Saint Martin Tour Website Loaded Successfully!');
