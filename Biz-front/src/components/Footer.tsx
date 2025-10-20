import { Blocks } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Blocks className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Coop Business</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building Nigeria's economic future through blockchain-powered rewards
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Intermediate</li>
              <li>Consumables</li>
              <li>Fashion</li>
              <li>Technology</li>
              <li>Services</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>How It Works</li>
              <li>FAQs</li>
              <li>Support</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Verification Process</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Coop Business. All rights reserved. Empowering Nigerian commerce.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
