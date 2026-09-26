"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/assets/logo.png" alt="GrowAIs" />
        </Link>
        <button className="menu" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="/for-schools" onClick={() => setOpen(false)}>For Schools</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link className="btn btn-outline" href="/login" onClick={() => setOpen(false)}>Log In</Link>
          <Link className="btn btn-primary" href="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
