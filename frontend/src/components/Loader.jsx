import { motion } from 'framer-motion';
import { GiFlowerTwirl } from 'react-icons/gi';

export default function Loader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1541 100%)', zIndex: 9999,
    }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '3rem', marginBottom: '1rem', display: 'inline-block' }}
        >
          <GiFlowerTwirl style={{ color: '#f43f5e', filter: 'drop-shadow(0 0 20px rgba(244,63,94,0.8))' }} />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: 'Playfair Display, serif', color: '#fda4af', fontSize: '1.1rem', letterSpacing: '0.1em' }}
        >
          Kiran Beauty
        </motion.p>
      </div>
    </div>
  );
}
