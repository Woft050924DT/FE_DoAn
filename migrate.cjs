const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');

const mappings = [
  { old: 'Home/index.tsx', new: 'home/page.tsx' },
  { old: 'Cart/index.tsx', new: 'cart/page.tsx' },
  { old: 'Checkout/index.tsx', new: 'checkout/page.tsx' },
  { old: 'Account/index.tsx', new: 'account/page.tsx' },
  { old: 'Login/index.tsx', new: 'login/page.tsx' },
  { old: 'Register/index.tsx', new: 'register/page.tsx' },
  { old: 'Product/List.tsx', new: 'products/page.tsx' },
  { old: 'Product/Detail.tsx', new: 'products/[id]/page.tsx' },
  { old: 'Admin/Dashboard.tsx', new: 'admin/page.tsx' },
  { old: 'Admin/Orders.tsx', new: 'admin/orders/page.tsx' },
  { old: 'Admin/Products.tsx', new: 'admin/products/page.tsx' },
  { old: 'Admin/Inventory.tsx', new: 'admin/inventory/page.tsx' },
  { old: 'Admin/Categories.tsx', new: 'admin/categories/page.tsx' },
  { old: 'Admin/Brands.tsx', new: 'admin/brands/page.tsx' },
];

function fixImports(content, depthDiff) {
    if (depthDiff === 0) return content;
    
    return content.replace(/from\s+['"](\.\.?\/[^'"]+)['"]/g, (match, p1) => {
        let result = p1;
        if (depthDiff > 0) {
            // we went deeper
            for(let i=0; i<depthDiff; i++) {
                if (result.startsWith('./')) {
                    result = '../' + result.substring(2);
                } else {
                    result = '../' + result;
                }
            }
        } else if (depthDiff < 0) {
            // we went shallower
            for(let i=0; i<-depthDiff; i++) {
                if (result.startsWith('../')) {
                    result = result.substring(3);
                    if (result === '') result = './';
                    else if (!result.startsWith('.')) result = './' + result;
                }
            }
        }
        return "from '" + result + "'";
    });
}

mappings.forEach(m => {
  const oldPath = path.join(srcApp, m.old);
  const newPath = path.join(srcApp, m.new);
  
  if (fs.existsSync(oldPath)) {
    const content = fs.readFileSync(oldPath, 'utf8');
    
    const oldDepth = m.old.split('/').length - 1; 
    const newDepth = m.new.split('/').length - 1;
    const depthDiff = newDepth - oldDepth;
    
    const newContent = fixImports(content, depthDiff);
    
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.writeFileSync(newPath, newContent);
    fs.unlinkSync(oldPath);
    console.log("Moved " + m.old + " to " + m.new);
  }
});
