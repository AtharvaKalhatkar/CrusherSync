export type Language = 'en' | 'mr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.parties': 'Parties',
    'nav.items': 'Items',
    'nav.bills': 'Bills',
    
    // Dashboard
    'dashboard.overview': 'Overview',
    'dashboard.totalSales': 'Total Sales (Cash In)',
    'dashboard.thisMonthSale': 'This Month Sale',
    'dashboard.lastMonthSale': 'Last Month Sale',
    'dashboard.thisYearSale': 'This Year Sale',
    'dashboard.parties': 'Parties',
    'dashboard.invoices': 'Invoices',
    'dashboard.itemsInStock': 'Items / Products in Stock',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.newInvoice': '+ New Invoice',
    'dashboard.addPayment': '+ Add Payment',

    // Customers
    'customers.title': 'Parties',
    'customers.addParty': 'Add Party',
    'customers.cancel': 'Cancel',
    'customers.nameLabel': 'Customer Name',
    'customers.namePlaceholder': 'Enter name',
    'customers.phoneLabel': 'Phone Number',
    'customers.phonePlaceholder': 'Enter mob no',
    'customers.save': 'Save Customer',
    'customers.noCustomers': 'No customers found. Add a customer to get started.',

    // General
    'app.title': 'Stone Crusher',
    'app.subtitle': 'Shree Kalbhairavnath',
  },
  mr: {
    // Navigation
    'nav.home': 'मुख्यपृष्ठ',
    'nav.parties': 'ग्राहक',
    'nav.items': 'वस्तू',
    'nav.bills': 'बिले',

    // Dashboard
    'dashboard.overview': 'आढावा',
    'dashboard.totalSales': 'एकूण विक्री (मिळालेली रक्कम)',
    'dashboard.thisMonthSale': 'या महिन्याची विक्री',
    'dashboard.lastMonthSale': 'मागील महिन्याची विक्री',
    'dashboard.thisYearSale': 'या वर्षाची विक्री',
    'dashboard.parties': 'ग्राहक',
    'dashboard.invoices': 'पावत्या',
    'dashboard.itemsInStock': 'स्टॉकमधील वस्तू',
    'dashboard.quickActions': 'जलद क्रिया',
    'dashboard.newInvoice': '+ नवीन पावती',
    'dashboard.addPayment': '+ पेमेंट जोडा',

    // Customers
    'customers.title': 'ग्राहक',
    'customers.addParty': 'ग्राहक जोडा',
    'customers.cancel': 'रद्द करा',
    'customers.nameLabel': 'ग्राहकाचे नाव',
    'customers.namePlaceholder': 'नाव प्रविष्ट करा',
    'customers.phoneLabel': 'फोन नंबर',
    'customers.phonePlaceholder': 'मोबाईल नंबर प्रविष्ट करा',
    'customers.save': 'ग्राहक जतन करा',
    'customers.noCustomers': 'कोणतेही ग्राहक आढळले नाहीत. प्रारंभ करण्यासाठी ग्राहक जोडा.',

    // General
    'app.title': 'स्टोन क्रशर',
    'app.subtitle': 'श्री काळभैरवनाथ',
  }
};
