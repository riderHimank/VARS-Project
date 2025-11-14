"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import styles from "./page.module.css";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { Regular } from "./models3d/Regular";
import { Hoodie } from "./models3d/Hoodie";
import { Oversized } from "./models3d/Oversized";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const merchandiseItems = [
    {
      id: 0,
      name: "Hoodie",
      modelType: "hoodie",
      title: "LEVEL AHEAD",
      description:
        '"The Alcher Lady\'s mind exploded into the arcade world, her thoughts scattered across levels and blocks. Wear the chaos, embrace the challenge. Game on with our exclusive mind-bending collection."',
      image: "/tshirt2.png",
    },
    {
      id: 1,
      name: "T-Shirt",
      modelType: "regular",
      title: "RESPAWN",
      description:
        "In the arcade of Alcheringa, you win, you lose, but you always respawn. Keep playing, keep fighting, and like the Alcher Kid, chase the highest score relentlessly!",
      image: "/tshirt1.png",
    },
    {
      id: 2,
      name: "Oversized T-Shirt",
      modelType: "oversized",
      title: "ARCADE",
      description:
        "Our 'Arcade' brings you the nostalgia of meeting friends after school, sharing laughs, and making memories. Meet me @ the arcade and relive those fun times together.",
      image: "/tshirt3.png",
    },
  ];
  const [current, setCurrent] = useState(1);
  const [currentm, setCurrentm] = useState(1);
  const [target, setTarget] = useState(new THREE.Vector3(0, 0, 0));
  const tshirts = ["/tshirt2.png", "/tshirt1.png", "/tshirt3.png"];
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(2);
  const [isVisible, setIsVisible] = useState(true);

  const handleExpandis = () => {
    setIsVisible(true);
  };

  const handleRight = () => {
    setIsVisible(false);
    setCurrent((current + 1) % 3);
    setLeft((left + 1) % 3);
    setRight((right + 1) % 3);
    console.log("Current:", current, "Left:", left, "Right:", right);
    setTimeout(() => {
      setCurrentm((currentm + 1) % 3);
      handleExpandis();
    }, 0);
  };

  const handleLeft = () => {
    setIsVisible(false);
    setCurrent((current + 2) % 3);
    setLeft((left + 2) % 3);
    setRight((right + 2) % 3);
    console.log("Current:", current, "Left:", left, "Right:", right);
    setTimeout(() => {
      setCurrentm((currentm + 2) % 3);
      handleExpandis();
    }, 0);
    // setCurrent((current + 2) % 3);
    // setLeft((left + 2) % 3);
    // setRight((right + 2) % 3);
    // console.log("Current:", current, "Left:", left, "Right:", right);
  };
  // Don't access window during render (prevents "window is not defined" on the server)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    // Set initial value on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleBtn1 = () => {
    setLeft(2);
    setRight(1);
    setCurrent(0);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentm(0);
      handleExpandis();
    }, 0);
  };

  const handleBtn2 = () => {
    setCurrent(1);
    setLeft(0);
    setRight(2);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentm(1);
      handleExpandis();
    }, 0);
  };

  const handleBtn3 = () => {
    setLeft(1);
    setRight(0);
    setCurrent(2);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentm(2);
      handleExpandis();
    }, 0);
  };

  const handleTryItNow = () => {
    const modelType = merchandiseItems[current].modelType;
    router.push(`/ar-tryon?model=${modelType}`);
  };

  return (
    <div
      className={styles.maindiv}
      style={{
        width: "100%",
        height: "120vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div className={styles.marquee}>
        <div className={styles.marquee1}>
          <Marquee direction="right" speed={30}>
            <Image
              src="/cloudRight.png"
              className={`${styles.cloudRight} ${styles.cloud}`}
              width="1000"
              height="1000"
              alt=""
            />
            <Image
              src="/cloudRight.png"
              className={`${styles.cloudRight} ${styles.cloud}`}
              width="1000"
              height="1000"
              alt=""
            />
            <Image
              src="/cloudRight.png"
              className={`${styles.cloudRight} ${styles.cloud}`}
              width="1000"
              height="1000"
              alt=""
            />
          </Marquee>
        </div>
        <div className={styles.marquee2}>
          <Marquee speed={10}>
            <Image
              src="/cloudLeft.png"
              className={`${styles.cloudLeft} ${styles.cloud}`}
              width="1000"
              height="1000"
              alt=""
            />
            <Image
              src="/cloudLeft.png"
              className={`${styles.cloudLeft} ${styles.cloud}`}
              width="1000"
              height="1000"
              alt=""
            />
            <Image
              src="/cloudLeft.png"
              className={`${styles.cloudLeft} ${styles.cloud}`}
              width="1000"
              height="1000"
              alt=""
            />
          </Marquee>
        </div>
      </div>
      <h1 className={styles.logo} style={{ fontFamily: "BrickPixel" }}>
        Alcher Merchandise
      </h1>
      <div className={styles.box}>
        <Canvas
          key={currentm}
          className={`${styles.model2} custom-canvas-class`}
          style={{
            touchAction: "none",
            pointerEvents: isMobile ? "none" : "auto",
          }}
        >
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            target={target} // Set the target to the center of the model
          />
          <ambientLight />

          {currentm == 0 && <Hoodie className="custom-hoodie-class" />}
          {currentm == 1 && <Regular className="custom-regular-class" />}
          {currentm == 2 && <Oversized className="custom-oversized-class" />}
        </Canvas>
      </div>

      {
        <div
          className={`${styles.arrowLeft} ${
            current == 0 ? styles.visibleleft : styles.done
          }`}
        >
          <h3 style={{ fontFamily: "BrickPixel" }}>LEVEL AHEAD</h3>
          <p style={{ fontFamily: "StoneSlab" }}>Hoodie</p>
          <p style={{ fontFamily: "GameTape", width: "3rem" }}>
            "The Alcher Lady's mind exploded into the arcade world, her thoughts
            scattered across levels and blocks.
            <br /> Wear the chaos, embrace the
            <br /> challenge. Game on with our exclusive mind-bending
            collection."
          </p>
        </div>
      }
      {
        <div
          className={`${styles.arrowLeft} ${
            current == 1 ? styles.visibleleft : styles.done
          }`}
        >
          <h3 style={{ fontFamily: "BrickPixel" }}>RESPAWN</h3>
          <p style={{ fontFamily: "StoneSlab" }}>T-Shirt</p>
          <p style={{ fontFamily: "GameTape", width: "3rem" }}>
            In the arcade of Alcheringa, you win, you lose, but you always
            respawn. Keep playing, keep fighting, and like the Alcher Kid, chase
            the highest score relentlessly!
          </p>
        </div>
      }
      {
        <div
          className={`${styles.arrowLeft} ${
            current == 2 ? styles.visibleleft : styles.done
          }`}
        >
          <h3 style={{ fontFamily: "BrickPixel" }}>ARCADE</h3>
          <p style={{ fontFamily: "StoneSlab" }}>Over Sized T-Shirt</p>
          <p style={{ fontFamily: "GameTape", width: "3rem" }}>
            Our 'Arcade' brings you the nostalgia of meeting friends after
            school, sharing laughs, and making memories. Meet me @ the arcade
            and relive those fun times together.
          </p>
        </div>
      }

      {
        <div
          className={`${styles.mobileMerch} ${
            current == 0 ? styles.visibleleft : styles.done
          }`}
        >
          <h3 style={{ fontFamily: "BrickPixel" }}>LEVEL AHEAD</h3>
          <p style={{ fontFamily: "StoneSlab" }}>Hoodie</p>
          <p style={{ fontFamily: "GameTape", width: "4rem" }}>
            "The Alcher Lady's mind exploded into the arcade world, her thoughts
            scattered across levels and blocks. Wear the chaos, embrace the
            challenge. Game on with our exclusive mind-bending collection."
          </p>
        </div>
      }
      {
        <div
          className={`${styles.mobileMerch} ${
            current == 1 ? styles.visibleleft : styles.done
          }`}
        >
          <h3 style={{ fontFamily: "BrickPixel" }}>RESPAWN</h3>
          <p style={{ fontFamily: "StoneSlab" }}>T-Shirt</p>
          <p style={{ fontFamily: "GameTape", width: "4rem" }}>
            In the arcade of Alcheringa, you win, you lose, but you always
            respawn. Keep playing, keep fighting, and like the Alcher Kid, chase
            the highest score relentlessly!
          </p>
        </div>
      }
      {
        <div
          className={`${styles.mobileMerch} ${
            current == 2 ? styles.visibleleft : styles.done
          }`}
        >
          <h3 style={{ fontFamily: "BrickPixel" }}>ARCADE</h3>
          <p style={{ fontFamily: "StoneSlab" }}>Over Sized T-Shirt</p>
          <p style={{ fontFamily: "GameTape", width: "4rem" }}>
            'Arcade' brings you the nostalgia of meeting friends after school,
            sharing laughs, and making memories. Meet me @ the arcade and relive
            those fun times together.
          </p>
        </div>
      }

      {current == 0 && !isMobile && (
        <button
          onClick={handleTryItNow}
          className={styles.btnMerchButton}
          aria-label="Try on"
        >
          <span
            className={styles.btnMerch}
            style={{
              fontFamily: "BrickPixel",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fe3989",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            Try in AR
          </span>
        </button>
      )}
      {current == 1 && !isMobile && (
        <button
          onClick={handleTryItNow}
          className={styles.btnMerchButton}
          aria-label="Try on"
        >
          <span
            className={styles.btnMerch}
            style={{
              fontFamily: "BrickPixel",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fe3989",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            Try in AR
          </span>
        </button>
      )}
      {current == 2 && !isMobile && (
        <button
          onClick={handleTryItNow}
          className={styles.btnMerchButton}
          aria-label="Try on"
        >
          <span
            className={styles.btnMerch}
            style={{
              fontFamily: "BrickPixel",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fe3989",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            Try in AR
          </span>
        </button>
      )}

      {current == 0 && isMobile && (
        <button
          onClick={handleTryItNow}
          className={styles.mobileBtnButton}
          aria-label="Try on"
        >
          <span
            className={styles.mobileBtn}
            style={{
              fontFamily: "BrickPixel",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fe3989",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            Try in AR
          </span>
        </button>
      )}
      {current == 1 && isMobile && (
        <button
          onClick={handleTryItNow}
          className={styles.mobileBtnButton}
          aria-label="Try on"
        >
          <span
            className={styles.mobileBtn}
            style={{
              fontFamily: "BrickPixel",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fe3989",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            Try in AR
          </span>
        </button>
      )}
      {current == 2 && isMobile && (
        <button
          onClick={handleTryItNow}
          className={styles.mobileBtnButton}
          aria-label="Try on"
        >
          <span
            className={styles.mobileBtn}
            style={{
              fontFamily: "BrickPixel",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fe3989",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            Try in AR
          </span>
        </button>
      )}

      <div className={styles.foot}></div>
      <div className={styles.leftBtns}>
        <button>
          <Image
            src="/arrowleft.svg"
            className={styles.leftMerchbtn}
            width="70"
            height="70"
            onClick={handleLeft}
            alt="Previous"
          />
        </button>
        <Image
          src={tshirts[left]}
          className={styles.leftTshirt}
          width="130"
          height="130"
          alt={merchandiseItems[left].name}
        />
      </div>
      <div className={styles.merchBtn}>
        <div
          className={
            currentm == 0
              ? `${styles.activeBtn} ${styles.merch3d} ${styles.bot}`
              : `${styles.merch3d} ${styles.bot}`
          }
          onClick={handleBtn1}
        >
          <Image
            src="/button3.svg"
            width="150"
            height="150"
            alt="Select Hoodie"
          />
        </div>
        <div
          className={
            currentm == 1
              ? `${styles.activeBtn} ${styles.merch3d} ${styles.bot}`
              : `${styles.merch3d} ${styles.bot}`
          }
          onClick={handleBtn2}
        >
          <Image
            src="/button1.svg"
            width="150"
            height="150"
            alt="Select T-Shirt"
          />
        </div>
        <div
          className={
            currentm == 2
              ? `${styles.activeBtn} ${styles.merch3d} ${styles.bot}`
              : `${styles.merch3d} ${styles.bot}`
          }
          onClick={handleBtn3}
        >
          <Image
            src="/button2.svg"
            width="150"
            height="150"
            alt="Select Oversized"
          />
        </div>
      </div>
      <div className={styles.rightBtns}>
        <Image
          src={tshirts[right]}
          className={styles.rightTshirt}
          width="130"
          height="130"
          alt={merchandiseItems[right].name}
        />
        <button>
          <Image
            src="/rightBtn.svg"
            className={styles.rightMerchbtn}
            width="70"
            height="70"
            onClick={handleRight}
            alt="Next"
          />
        </button>
      </div>
    </div>
  );
}
