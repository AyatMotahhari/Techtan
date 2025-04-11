import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import { teamMembersApi, projectsApi, servicesApi, contactApi } from './firebaseApi';

// Language translations
const translations = {
  en: {
    home: {
      title: 'Building Ideas into Digital Reality.',
      subtitle: 'At Techtan, we fuse creativity with engineering to build smart, scalable, and elegant software solutions.',
      cta: 'Get in Touch'
    },
    team: {
      title: 'Our Team',
      noTeam: 'No team members to display. Log in to add team members.'
    },
    projects: {
      title: 'Our Projects',
      viewDetails: 'View Details',
      noProjects: 'No projects to display. Log in to add projects.'
    },
    services: {
      title: 'Our Services',
      noServices: 'No services to display. Log in to add services.'
    },
    contact: {
      title: 'Contact Us',
      name: 'Your Name',
      email: 'Email Address',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message Sent!',
      thankYou: 'Thank you for contacting us. We\'ll get back to you soon.'
    },
    footer: {
      copyright: '© {year} DevTeam Solutions. All rights reserved.',
      services: 'Professional Web Development Services',
      login: 'Admin Login'
    },
    nav: {
      team: 'Team',
      projects: 'Projects',
      services: 'Services',
      contact: 'Contact'
    }
  },
  fa: {
    home: {
      title: 'ایده‌ها را به واقعیت دیجیتال تبدیل می‌کنیم.',
      subtitle: 'در Techtan، خلاقیت را با مهندسی ترکیب می‌کنیم تا راه‌حل‌های نرم‌افزاری هوشمند، مقیاس‌پذیر و شیک بسازیم.',
      cta: 'تماس با ما'
    },
    team: {
      title: 'تیم ما',
      noTeam: 'هیچ عضو تیمی برای نمایش وجود ندارد. برای افزودن اعضای تیم وارد شوید.'
    },
    projects: {
      title: 'پروژه های ما',
      viewDetails: 'مشاهده جزئیات',
      noProjects: 'هیچ پروژه ای برای نمایش وجود ندارد. برای افزودن پروژه ها وارد شوید.'
    },
    services: {
      title: 'خدمات ما',
      noServices: 'هیچ خدماتی برای نمایش وجود ندارد. برای افزودن خدمات وارد شوید.'
    },
    contact: {
      title: 'تماس با ما',
      name: 'نام شما',
      email: 'آدرس ایمیل',
      message: 'پیام',
      send: 'ارسال پیام',
      sending: 'در حال ارسال...',
      success: 'پیام ارسال شد!',
      thankYou: 'از تماس شما متشکریم. به زودی با شما تماس خواهیم گرفت.'
    },
    footer: {
      copyright: '© {year} DevTeam Solutions. تمامی حقوق محفوظ است.',
      services: 'خدمات حرفه ای توسعه وب',
      login: 'ورود مدیر'
    },
    nav: {
      team: 'تیم',
      projects: 'پروژه ها',
      services: 'خدمات',
      contact: 'تماس'
    }
  },
  ar: {
    home: {
      title: 'نبني الأفكار إلى واقع رقمي.',
      subtitle: 'في تيكتان، ندمج الإبداع مع الهندسة لبناء حلول برمجية ذكية وقابلة للتوسع وأنيقة.',
      cta: 'تواصل معنا'
    },
    team: {
      title: 'فريقنا',
      noTeam: 'لا يوجد أعضاء فريق للعرض. قم بتسجيل الدخول لإضافة أعضاء الفريق.'
    },
    projects: {
      title: 'مشاريعنا',
      viewDetails: 'عرض التفاصيل',
      noProjects: 'لا توجد مشاريع للعرض. قم بتسجيل الدخول لإضافة المشاريع.'
    },
    services: {
      title: 'خدماتنا',
      noServices: 'لا توجد خدمات للعرض. قم بتسجيل الدخول لإضافة الخدمات.'
    },
    contact: {
      title: 'اتصل بنا',
      name: 'اسمك',
      email: 'عنوان البريد الإلكتروني',
      message: 'رسالة',
      send: 'إرسال رسالة',
      sending: 'جاري الإرسال...',
      success: 'تم إرسال الرسالة!',
      thankYou: 'شكرا لتواصلك معنا. سنعاود الاتصال بك قريبا.'
    },
    footer: {
      copyright: '© {year} DevTeam Solutions. جميع الحقوق محفوظة.',
      services: 'خدمات تطوير الويب الاحترافية',
      login: 'تسجيل دخول المسؤول'
    },
    nav: {
      team: 'الفريق',
      projects: 'المشاريع',
      services: 'الخدمات',
      contact: 'اتصل بنا'
    }
  }
};

const TeamWebsite = () => {
  // Initialize state with empty arrays
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [language, setLanguage] = useState('en'); // Default language is English
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu
  const [langDropdownOpen, setLangDropdownOpen] = useState(false); // State for language dropdown
  
  // Add loading states to show feedback to users
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Mobile slider state
  const [currentProjectSlide, setCurrentProjectSlide] = useState(0);
  const [currentServiceSlide, setCurrentServiceSlide] = useState(0);
  const [currentTabletServiceSlide, setCurrentTabletServiceSlide] = useState(0);
  const [currentDesktopServiceSlide, setCurrentDesktopServiceSlide] = useState(0);
  
  const formRef = useRef();
  const langDropdownRef = useRef(null);
  
  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langDropdownRef]);
  
  // Function to get translated text
  const t = (section, key) => {
    return translations[language][section][key];
  };
  
  // Replace year in copyright text
  const replaceYear = (text) => {
    return text.replace('{year}', new Date().getFullYear());
  };
  
  // Test localStorage functionality
  useEffect(() => {
    try {
      // Test if localStorage is working
      localStorage.setItem('test', 'test');
      const test = localStorage.getItem('test');
      if (test !== 'test') {
        console.error('localStorage is not working correctly');
      } else {
        console.log('localStorage is working correctly');
        localStorage.removeItem('test');
      }
      
      // Check if contactSubmissions exists
      const submissions = localStorage.getItem('contactSubmissions');
      console.log('Current contact submissions in localStorage:', submissions ? JSON.parse(submissions) : 'none');
    } catch (error) {
      console.error('Error testing localStorage:', error);
    }
  }, []);
  
  // Load data from API or localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      // Track whether we've shown data to the user
      let hasDisplayedData = false;
      console.log('Starting data loading process...');
      
      // First try to load data from localStorage for immediate display
      try {
        const loadedTeamMembers = localStorage.getItem('teamMembers');
        const loadedProjects = localStorage.getItem('projects');
        const loadedServices = localStorage.getItem('services');
        
        let localDataAvailable = false;
        
        if (loadedTeamMembers) {
          const parsed = JSON.parse(loadedTeamMembers);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Loaded ${parsed.length} team members from localStorage (initial load)`);
            setTeamMembers(parsed);
            localDataAvailable = true;
          }
        }
        
        if (loadedProjects) {
          const parsed = JSON.parse(loadedProjects);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Loaded ${parsed.length} projects from localStorage (initial load)`);
            setProjects(parsed);
            localDataAvailable = true;
          }
        }
        
        if (loadedServices) {
          const parsed = JSON.parse(loadedServices);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Loaded ${parsed.length} services from localStorage (initial load)`);
            setServices(parsed);
            localDataAvailable = true;
          }
        }
        
        if (localDataAvailable) {
          console.log('Using localStorage data for initial display while fetching from Firebase');
          hasDisplayedData = true;
        }
      } catch (localStorageError) {
        console.error('Error loading from localStorage (initial attempt):', localStorageError);
      }
      
      // Then try to load fresher data from Firebase
      try {
        console.log('Attempting to load data from Firebase...');
        
        // Load team members
        const teamMembersData = await teamMembersApi.getAll();
        if (teamMembersData && Array.isArray(teamMembersData)) {
          console.log(`Loaded ${teamMembersData.length} team members from Firebase`);
          setTeamMembers(teamMembersData);
          hasDisplayedData = true;
        } else {
          console.warn('Team members data from Firebase is not an array or is empty');
        }
        
        // Load projects
        const projectsData = await projectsApi.getAll();
        if (projectsData && Array.isArray(projectsData)) {
          console.log(`Loaded ${projectsData.length} projects from Firebase`);
          setProjects(projectsData);
          hasDisplayedData = true;
        } else {
          console.warn('Projects data from Firebase is not an array or is empty');
        }
        
        // Load services
        const servicesData = await servicesApi.getAll();
        if (servicesData && Array.isArray(servicesData)) {
          console.log(`Loaded ${servicesData.length} services from Firebase`);
          setServices(servicesData);
          hasDisplayedData = true;
        } else {
          console.warn('Services data from Firebase is not an array or is empty');
        }
        
        // If we successfully loaded from Firebase, we're done
        if (hasDisplayedData) {
          console.log('Successfully loaded data from Firebase');
          return;
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        setLoadError('Could not connect to the database');
      }
      
      // If we get here and haven't displayed data yet, try localStorage again as a final fallback
      if (!hasDisplayedData) {
        console.warn('Failed to load data from Firebase, using localStorage as final fallback');
        try {
          // This is a deeper fallback attempt - we'll accept empty arrays
          const loadedTeamMembers = localStorage.getItem('teamMembers');
          const loadedProjects = localStorage.getItem('projects');
          const loadedServices = localStorage.getItem('services');
          
          if (loadedTeamMembers) {
            const parsed = JSON.parse(loadedTeamMembers);
            console.log(`Loaded ${parsed.length} team members from localStorage (fallback)`);
            setTeamMembers(parsed);
          } else {
            console.warn('No team members found in localStorage, using empty array');
            setTeamMembers([]);
          }
          
          if (loadedProjects) {
            const parsed = JSON.parse(loadedProjects);
            console.log(`Loaded ${parsed.length} projects from localStorage (fallback)`);
            setProjects(parsed);
          } else {
            console.warn('No projects found in localStorage, using empty array');
            setProjects([]);
          }
          
          if (loadedServices) {
            const parsed = JSON.parse(loadedServices);
            console.log(`Loaded ${parsed.length} services from localStorage (fallback)`);
            setServices(parsed);
          } else {
            console.warn('No services found in localStorage, using empty array');
            setServices([]);
          }
        } catch (error) {
          console.error('Error loading from localStorage (fallback attempt):', error);
          // If everything fails, ensure we have empty arrays
          setTeamMembers([]);
          setProjects([]);
          setServices([]);
        }
      }
      
      // Always turn off loading indicator when done
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Intersection Observer to detect which section is currently in view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6,
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create the new submission object
    const newSubmission = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString(),
      isNew: true // Flag for notification in CMS
    };
    
    try {
      // Save submission using the API
      await contactApi.add(newSubmission);
      console.log('Contact form submitted successfully');
      
      // Send email using EmailJS
      emailjs.sendForm(
        'service_b2s1ngf',
        'template_5jk8gai',
        formRef.current,
        'fGkt_Y7hHDzWdhXT8'
      )
        .then(() => {
          setIsSubmitting(false);
          setFormData({ name: "", email: "", message: "" });
          setFormSubmitted(true);
          setTimeout(() => setFormSubmitted(false), 5000);
        })
        .catch((error) => {
          console.error('Email sending failed:', error);
          setIsSubmitting(false);
          alert("Your message was saved but email delivery failed. We'll still receive your message.");
        });
    } catch (error) {
      console.error('Error saving contact submission:', error);
      
      // Fallback to localStorage if API fails
      try {
        // Get current submissions from localStorage
        const currentSubmissionsStr = localStorage.getItem('contactSubmissions');
        let currentSubmissions = [];
        
        // Parse existing submissions if they exist
        if (currentSubmissionsStr) {
          try {
            const parsed = JSON.parse(currentSubmissionsStr);
            if (Array.isArray(parsed)) {
              currentSubmissions = parsed;
            }
          } catch (error) {
            console.error('Error parsing existing submissions:', error);
          }
        }
        
        // Add new submission
        currentSubmissions.push(newSubmission);
        
        // Save back to localStorage
        localStorage.setItem('contactSubmissions', JSON.stringify(currentSubmissions));
        
        // Send email using EmailJS
        emailjs.sendForm(
          'service_b2s1ngf',
          'template_5jk8gai',
          formRef.current,
          'fGkt_Y7hHDzWdhXT8'
        )
          .then(() => {
            setIsSubmitting(false);
            setFormData({ name: "", email: "", message: "" });
            setFormSubmitted(true);
            setTimeout(() => setFormSubmitted(false), 5000);
          })
          .catch((emailError) => {
            console.error('Email sending failed:', emailError);
            setIsSubmitting(false);
            alert("Your message was saved locally but email delivery failed. We'll still receive your message when we check the admin panel.");
          });
      } catch (localError) {
        console.error('Error with localStorage fallback:', localError);
        setIsSubmitting(false);
        alert("There was an error saving your message. Please try again or contact us directly.");
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  // Change language handler
  const changeLanguage = (lang) => {
    setLanguage(lang);
    // Set text direction based on language
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
    setLangDropdownOpen(false); // Close dropdown after selection
    
    // Fix for RTL language specific styles
    const htmlElement = document.documentElement;
    if (lang === 'en') {
      htmlElement.classList.remove('rtl-layout');
    } else {
      htmlElement.classList.add('rtl-layout');
    }
  };

  // Get language display name
  const getLanguageDisplay = () => {
    switch(language) {
      case 'fa': return 'فارسی';
      case 'ar': return 'العربية';
      default: return 'English';
    }
  };

  // Function to handle slider navigation
  const nextSlide = (type) => {
    if (type === 'project') {
      setCurrentProjectSlide((prev) => 
        prev === projects.length - 1 ? 0 : prev + 1
      );
    } else if (type === 'service') {
      setCurrentServiceSlide((prev) => 
        prev === services.length - 1 ? 0 : prev + 1
      );
    } else if (type === 'tablet-service') {
      const maxSlides = Math.ceil(services.length / 2);
      setCurrentTabletServiceSlide((prev) => 
        prev === maxSlides - 1 ? 0 : prev + 1
      );
    } else if (type === 'desktop-service') {
      const maxSlides = Math.ceil(services.length / 3);
      setCurrentDesktopServiceSlide((prev) => 
        prev === maxSlides - 1 ? 0 : prev + 1
      );
    }
  };

  const prevSlide = (type) => {
    if (type === 'project') {
      setCurrentProjectSlide((prev) => 
        prev === 0 ? projects.length - 1 : prev - 1
      );
    } else if (type === 'service') {
      setCurrentServiceSlide((prev) => 
        prev === 0 ? services.length - 1 : prev - 1
      );
    } else if (type === 'tablet-service') {
      const maxSlides = Math.ceil(services.length / 2);
      setCurrentTabletServiceSlide((prev) => 
        prev === 0 ? maxSlides - 1 : prev - 1
      );
    } else if (type === 'desktop-service') {
      const maxSlides = Math.ceil(services.length / 3);
      setCurrentDesktopServiceSlide((prev) => 
        prev === 0 ? maxSlides - 1 : prev - 1
      );
    }
  };

  // Add CSS for animations and RTL fixes
  useEffect(() => {
    // Add the animation styles to the document head
    const animationStyles = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 1s ease-out;
      }
      
      .animate-slideUp {
        animation: slideUp 1s ease-out;
        animation-fill-mode: forwards;
      }
      
      .delay-500 {
        animation-delay: 0.5s;
      }
      
      .delay-1000 {
        animation-delay: 1s;
      }
      
      /* RTL specific fixes */
      .rtl-layout .flex.items-center.space-x-1 {
        flex-direction: row-reverse;
      }
      
      .rtl-layout .ml-1 {
        margin-left: 0;
        margin-right: 0.25rem;
      }
      
      .rtl-layout .mr-2,
      .rtl-layout .mr-3,
      .rtl-layout .mr-4 {
        margin-right: 0;
      }
      
      .rtl-layout .mr-2 {
        margin-left: 0.5rem;
      }
      
      .rtl-layout .mr-3 {
        margin-left: 0.75rem;
      }
      
      .rtl-layout .mr-4 {
        margin-left: 1rem;
      }
      
      .rtl-layout .space-x-1 > * + * {
        margin-left: 0;
        margin-right: 0.25rem;
      }
      
      .rtl-layout .space-x-2 > * + * {
        margin-left: 0;
        margin-right: 0.5rem;
      }
      
      .rtl-layout .space-x-3 > * + * {
        margin-left: 0;
        margin-right: 0.75rem;
      }
      
      .rtl-layout .space-x-8 > * + * {
        margin-left: 0;
        margin-right: 2rem;
      }
    `;
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = animationStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Add this empty state renderer
  const renderEmptyState = (type) => {
    return (
      <div className="text-center py-8">
        {isLoading ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">{t('common', 'loading')}</p>
          </div>
        ) : loadError ? (
          <div>
            <p className="text-red-500 mb-2">{loadError}</p>
            <p className="text-gray-500">{t('common', 'tryAgain')}</p>
          </div>
        ) : (
          <p className="text-gray-500">
            {type === 'team' && t('team', 'noMembers')}
            {type === 'projects' && t('projects', 'noProjects')}
            {type === 'services' && t('services', 'noServices')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-white ${language !== 'en' ? 'font-sans' : ''}`}>
      {/* Header with Logo - Sticky */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Updated logo */}
              <img src={`${process.env.PUBLIC_URL}/techtan-logo.png`} alt="Techtan Logo" className="h-10 mr-3" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <nav className="mr-4">
                <ul className="flex space-x-8">
                  <li>
                    <button 
                      onClick={() => scrollToSection('team')} 
                      className={`py-2 px-1 font-medium text-sm transition-colors ${
                        activeSection === 'team' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('nav', 'team')}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('projects')} 
                      className={`py-2 px-1 font-medium text-sm transition-colors ${
                        activeSection === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('nav', 'projects')}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('services')} 
                      className={`py-2 px-1 font-medium text-sm transition-colors ${
                        activeSection === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('nav', 'services')}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('contact')} 
                      className={`py-2 px-1 font-medium text-sm transition-colors ${
                        activeSection === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('nav', 'contact')}
                    </button>
                  </li>
              </ul>
            </nav>
              
              {/* Language Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button 
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-gray-900 focus:outline-none"
                >
                  <span>{getLanguageDisplay()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {langDropdownOpen && (
                  <div className={`absolute ${language === 'en' ? 'right-0' : 'left-0'} mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200`}>
                    <button 
                      onClick={() => changeLanguage('en')}
                      className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${language === 'en' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => changeLanguage('fa')}
                      className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${language === 'fa' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      فارسی
                    </button>
                    <button 
                      onClick={() => changeLanguage('ar')}
                      className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${language === 'ar' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      العربية
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none mr-2"
              >
                {language.toUpperCase()}
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="container mx-auto px-4">
              <nav className="flex flex-col space-y-3 py-3">
                {/* Language Switcher for Mobile */}
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <p className="text-xs text-gray-500 mb-2">Select Language</p>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => changeLanguage('en')}
                      className={`py-2 px-4 text-left rounded-md text-sm ${
                        language === 'en' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => changeLanguage('fa')}
                      className={`py-2 px-4 text-left rounded-md text-sm ${
                        language === 'fa' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      فارسی
                    </button>
                    <button 
                      onClick={() => changeLanguage('ar')}
                      className={`py-2 px-4 text-left rounded-md text-sm ${
                        language === 'ar' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => scrollToSection('team')} 
                  className={`py-2 px-4 text-left rounded-md font-medium text-sm ${
                    activeSection === 'team' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('nav', 'team')}
                </button>
                <button 
                  onClick={() => scrollToSection('projects')} 
                  className={`py-2 px-4 text-left rounded-md font-medium text-sm ${
                    activeSection === 'projects' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('nav', 'projects')}
                </button>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className={`py-2 px-4 text-left rounded-md font-medium text-sm ${
                    activeSection === 'services' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('nav', 'services')}
                </button>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className={`py-2 px-4 text-left rounded-md font-medium text-sm ${
                    activeSection === 'contact' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('nav', 'contact')}
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Background Image and Animated Text */}
      <section 
        id="home" 
        className="relative flex items-center justify-center"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/hero-background.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10 py-20 mt-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white animate-fadeIn">
            {t('home', 'title')}
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200 animate-slideUp opacity-0 delay-500">
            {t('home', 'subtitle')}
          </p>
          <button 
            onClick={() => scrollToSection('contact')}
            className="mt-10 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition animate-fadeIn delay-1000"
          >
            {t('home', 'cta')}
          </button>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-gray-900">{t('team', 'title')}</h2>
          {teamMembers.length > 0 ? (
            <div className={`grid grid-cols-1 ${teamMembers.length < 3 ? 'sm:grid-cols-2 lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4 md:gap-6 justify-center max-w-4xl mx-auto`}>
              {teamMembers.map(member => (
                <div key={member.id} className="bg-gray-50 rounded-md p-4 md:p-5 text-center hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-64 relative">
                  <div>
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 object-cover"
                    />
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 mb-2 text-sm">{member.role}</p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-gray-600 text-sm">{member.email}</p>
                    {member.phone && <p className="text-gray-600 text-sm">{member.phone}</p>}
                    <div className="flex justify-center mt-2 space-x-3">
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderEmptyState('team')
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-gray-900">{t('projects', 'title')}</h2>
          {projects.length > 0 ? (
            <>
              {/* Desktop View */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {projects.map(project => (
                  <div key={project.id} className="bg-white rounded-md overflow-hidden hover:shadow-md transition-shadow duration-300 relative">
                    <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                    <div className="p-4 md:p-5">
                      <h3 className="text-lg font-medium mb-2 text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{project.description}</p>
                      {project.link ? (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-3 inline-block text-blue-600 text-sm font-medium hover:text-blue-800"
                        >
                          {t('projects', 'viewDetails')}
                        </a>
                      ) : (
                        <button className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-800">
                          {t('projects', 'viewDetails')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobile View with Simple Slider */}
              <div className="md:hidden relative">
                <div className="overflow-hidden rounded-md">
                  {projects.length > 0 && (
                    <div className="bg-white rounded-md overflow-hidden hover:shadow-md transition-shadow duration-300 relative">
                      <img 
                        src={projects[currentProjectSlide].image} 
                        alt={projects[currentProjectSlide].title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 md:p-5">
                        <h3 className="text-lg font-medium mb-2 text-gray-900">
                          {projects[currentProjectSlide].title}
                        </h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {projects[currentProjectSlide].description}
                        </p>
                        {projects[currentProjectSlide].link ? (
                          <a 
                            href={projects[currentProjectSlide].link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-3 inline-block text-blue-600 text-sm font-medium hover:text-blue-800"
                          >
                            {t('projects', 'viewDetails')}
                          </a>
                        ) : (
                          <button className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-800">
                            {t('projects', 'viewDetails')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Navigation Buttons */}
                {projects.length > 1 && (
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => prevSlide('project')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex space-x-2">
                      {projects.map((_, index) => (
                        <span 
                          key={index}
                          className={`h-2 w-2 rounded-full ${
                            currentProjectSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        ></span>
                      ))}
                    </div>
                    <button 
                      onClick={() => nextSlide('project')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            renderEmptyState('projects')
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-gray-900">{t('services', 'title')}</h2>
          {services.length > 0 ? (
            <>
              {/* Desktop View (3 items per slide) */}
              <div className="hidden lg:block relative">
                <div className="max-w-[98%] mx-auto overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out" 
                    style={{ transform: `translateX(-${currentDesktopServiceSlide * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(services.length / 3) }).map((_, slideIndex) => (
                      <div key={`desktop-slide-${slideIndex}`} className="min-w-full flex-shrink-0 w-full">
                        <div className="grid grid-cols-3 gap-5">
                          {services.slice(slideIndex * 3, slideIndex * 3 + 3).map((service, index) => (
                            <div key={service.id} className="group h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                              {/* Service Header with Gradient */}
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 relative overflow-hidden">
                                {/* Decorative shapes */}
                                <div className="absolute right-0 top-0 -mt-4 -mr-4 w-20 h-20 rounded-full bg-white opacity-10"></div>
                                <div className="absolute left-0 bottom-0 -mb-8 -ml-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                                
                                {/* Service Icon if available */}
                                {service.icon && (
                                  <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <img src={service.icon} alt="" className="w-6 h-6" />
                                  </div>
                                )}
                                
                                {/* Service Title */}
                                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                                
                                {/* Service Price */}
                                <div className="flex items-center">
                                  <p className="text-white/90 text-base font-bold">
                                    {service.price}
                                  </p>
                                </div>
                                
                                {/* Short intro text if available */}
                                {service.shortIntro && (
                                  <p className="text-blue-100 text-sm mt-2">{service.shortIntro}</p>
                                )}
                              </div>
                              
                              {/* Service Body */}
                              <div className="p-6 flex-grow">
                                {/* Plain text description */}
                                {service.description && (
                                  <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
                                )}
                                
                                {/* Feature list */}
                                {service.features && service.features.length > 0 ? (
                                  <ul className="space-y-3">
                                    {service.features.map((feature, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-amber-500 mr-2">•</span>
                                        <span className="text-gray-700">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  // If no features array but description has line breaks, convert to bullet points
                                  <ul className="space-y-3">
                                    {service.description && service.description.split('\n').filter(line => line.trim()).map((line, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-amber-500 mr-2">•</span>
                                        <span className="text-gray-700">{line.trim()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                
                                {/* CTA Button */}
                                {service.ctaLink && (
                                  <div className="mt-6">
                                    <a 
                                      href={service.ctaLink} 
                                      className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors"
                                    >
                                      Learn more
                                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                      </svg>
                                    </a>
                                  </div>
                                )}
                              </div>
                              
                              {/* Service Footer with delivery time */}
                              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <p className="text-sm text-gray-700">
                                  {service.deliveryTime ? `Delivery: ${service.deliveryTime}` : "Delivery: 3-5 days"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation for Desktop */}
                {services.length > 3 && (
                  <div className="flex justify-between items-center mt-8">
                    <button 
                      onClick={() => prevSlide('desktop-service')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      aria-label="Previous slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.ceil(services.length / 3) }).map((_, index) => (
                        <span 
                          key={`desktop-dot-${index}`}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            currentDesktopServiceSlide === index ? 'bg-blue-600 w-4' : 'bg-gray-300'
                          }`}
                        ></span>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => nextSlide('desktop-service')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      aria-label="Next slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Tablet View (2 items per slide) */}
              <div className="hidden md:block lg:hidden relative">
                <div className="max-w-[98%] mx-auto overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out" 
                    style={{ transform: `translateX(-${currentTabletServiceSlide * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(services.length / 2) }).map((_, slideIndex) => (
                      <div key={`tablet-slide-${slideIndex}`} className="min-w-full flex-shrink-0 w-full">
                        <div className="grid grid-cols-2 gap-5">
                          {services.slice(slideIndex * 2, slideIndex * 2 + 2).map((service, index) => (
                            <div key={service.id} className="group h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                              {/* Service Header with Gradient */}
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 relative overflow-hidden">
                                {/* Decorative shapes */}
                                <div className="absolute right-0 top-0 -mt-4 -mr-4 w-20 h-20 rounded-full bg-white opacity-10"></div>
                                <div className="absolute left-0 bottom-0 -mb-8 -ml-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                                
                                {/* Service Icon if available */}
                                {service.icon && (
                                  <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <img src={service.icon} alt="" className="w-6 h-6" />
                                  </div>
                                )}
                                
                                {/* Service Title */}
                                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                                
                                {/* Service Price */}
                                <div className="flex items-center">
                                  <p className="text-white/90 text-base font-bold">
                                    {service.price}
                                  </p>
                                </div>
                                
                                {/* Short intro text if available */}
                                {service.shortIntro && (
                                  <p className="text-blue-100 text-sm mt-2">{service.shortIntro}</p>
                                )}
                              </div>
                              
                              {/* Service Body */}
                              <div className="p-6 flex-grow">
                                {/* Plain text description */}
                                {service.description && (
                                  <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
                                )}
                                
                                {/* Feature list */}
                                {service.features && service.features.length > 0 ? (
                                  <ul className="space-y-3">
                                    {service.features.map((feature, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-amber-500 mr-2">•</span>
                                        <span className="text-gray-700">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  // If no features array but description has line breaks, convert to bullet points
                                  <ul className="space-y-3">
                                    {service.description && service.description.split('\n').filter(line => line.trim()).map((line, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-amber-500 mr-2">•</span>
                                        <span className="text-gray-700">{line.trim()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                
                                {/* CTA Button */}
                                {service.ctaLink && (
                                  <div className="mt-6">
                                    <a 
                                      href={service.ctaLink} 
                                      className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors"
                                    >
                                      Learn more
                                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                      </svg>
                                    </a>
                                  </div>
                                )}
                              </div>
                              
                              {/* Service Footer with delivery time */}
                              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <p className="text-sm text-gray-700">
                                  {service.deliveryTime ? `Delivery: ${service.deliveryTime}` : "Delivery: 3-5 days"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation for Tablet */}
                {services.length > 2 && (
                  <div className="flex justify-between items-center mt-8">
                    <button 
                      onClick={() => prevSlide('tablet-service')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      aria-label="Previous slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.ceil(services.length / 2) }).map((_, index) => (
                        <span 
                          key={`tablet-dot-${index}`}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            currentTabletServiceSlide === index ? 'bg-blue-600 w-4' : 'bg-gray-300'
                          }`}
                        ></span>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => nextSlide('tablet-service')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      aria-label="Next slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile View (1 item per slide) */}
              <div className="md:hidden relative">
                <div className="overflow-hidden rounded-md">
                  {services.length > 0 && (
                    <div className="group h-full bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
                      {/* Service Header with Gradient */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 relative overflow-hidden">
                        {/* Decorative shapes */}
                        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-20 h-20 rounded-full bg-white opacity-10"></div>
                        <div className="absolute left-0 bottom-0 -mb-8 -ml-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                        
                        {/* Service Icon if available */}
                        {services[currentServiceSlide].icon && (
                          <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                            <img src={services[currentServiceSlide].icon} alt="" className="w-6 h-6" />
                          </div>
                        )}
                        
                        {/* Service Title */}
                        <h3 className="text-xl font-bold text-white mb-3">{services[currentServiceSlide].title}</h3>
                        
                        {/* Service Price */}
                        <div className="flex items-center">
                          <p className="text-white/90 text-base font-bold">
                            {services[currentServiceSlide].price}
                          </p>
                        </div>
                        
                        {/* Short intro text if available */}
                        {services[currentServiceSlide].shortIntro && (
                          <p className="text-blue-100 text-sm mt-2">{services[currentServiceSlide].shortIntro}</p>
                        )}
                      </div>
                      
                      {/* Service Body */}
                      <div className="p-6 flex-grow">
                        {/* Plain text description */}
                        {services[currentServiceSlide].description && (
                          <p className="text-gray-700 mb-4 text-sm">{services[currentServiceSlide].description}</p>
                        )}
                        
                        {/* Feature list */}
                        {services[currentServiceSlide].features && services[currentServiceSlide].features.length > 0 ? (
                          <ul className="space-y-3">
                            {services[currentServiceSlide].features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-amber-500 mr-2">•</span>
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          // If no features array but description has line breaks, convert to bullet points
                          <ul className="space-y-3">
                            {services[currentServiceSlide].description && services[currentServiceSlide].description.split('\n').filter(line => line.trim()).map((line, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-amber-500 mr-2">•</span>
                                <span className="text-gray-700">{line.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* CTA Button */}
                        {services[currentServiceSlide].ctaLink && (
                          <div className="mt-6">
                            <a 
                              href={services[currentServiceSlide].ctaLink} 
                              className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors"
                            >
                              Learn more
                              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {/* Service Footer with delivery time */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-700">
                          {services[currentServiceSlide].deliveryTime ? `Delivery: ${services[currentServiceSlide].deliveryTime}` : "Delivery: 3-5 days"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Navigation Buttons for Mobile */}
                {services.length > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <button 
                      onClick={() => prevSlide('service')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      aria-label="Previous slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex space-x-2">
                      {services.map((_, index) => (
                        <span 
                          key={index}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            currentServiceSlide === index ? 'bg-blue-600 w-4' : 'bg-gray-300'
                          }`}
                        ></span>
                      ))}
                    </div>
                    <button 
                      onClick={() => nextSlide('service')}
                      className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      aria-label="Next slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            renderEmptyState('services')
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-gray-900">{t('contact', 'title')}</h2>
          <div className="max-w-xl mx-auto bg-white rounded-md p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
            {formSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('contact', 'success')}</h3>
                <p className="text-gray-600">{t('contact', 'thankYou')}</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleFormSubmit}>
              <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2 text-sm">{t('contact', 'name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2 text-sm">{t('contact', 'email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 mb-2 text-sm">{t('contact', 'message')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition w-full text-sm disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
              >
                  {isSubmitting ? t('contact', 'sending') : t('contact', 'send')}
              </button>
            </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src={`${process.env.PUBLIC_URL}/techtan-logo.png`} alt="Techtan Logo" className="h-10 mr-3" />
              <p className="text-gray-400 text-sm">{t('footer', 'services')}</p>
            </div>
            <div className="text-sm">
              <p>{replaceYear(t('footer', 'copyright').replace('DevTeam Solutions', 'Techtan'))}</p>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                {t('footer', 'login')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TeamWebsite;