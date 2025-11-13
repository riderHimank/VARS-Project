"use client"
import { OrbitControls, SpotLight } from '@react-three/drei';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import styles from './page.module.css';
import Image from 'next/image';
import Marquee from "react-fast-marquee";
import { Regular } from './models3d/Regular';
import { Hoodie } from './models3d/Hoodie';
import { Oversized } from './models3d/Oversized';
import { useRouter } from 'next/navigation';

function Model({ url, setTarget, scale }) {
    const gltf = useLoader(GLTFLoader, url, loader => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/'); // Ensure the path is correct
        loader.setDRACOLoader(dracoLoader);
    });
    const modelRef = useRef(null);

    useEffect(() => {
        if (modelRef.current) {
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const center = box.getCenter(new THREE.Vector3());
            setTarget(center);
        }
    }, [gltf, setTarget]);

    useFrame(() => {
        if (modelRef.current) {
            modelRef.current.rotation.y += 0.002;
        }
    });

    return <primitive ref={modelRef} object={gltf.scene} scale={scale} />;
}

export default function Page() {
  const router = useRouter();
  
  const merchandiseItems = [
    {
      id: 0,
      name: 'Hoodie',
      modelType: 'hoodie',
      title: 'LEVEL AHEAD',
      price: '₹ 900',
      description:
        '"The Alcher Lady\'s mind exploded into the arcade world, her thoughts scattered across levels and blocks. Wear the chaos, embrace the challenge. Game on with our exclusive mind-bending collection."',
      image: '/tshirt2.png',
    },
    {
      id: 1,
      name: 'T-Shirt',
      modelType: 'regular',
      title: 'RESPAWN',
      price: '₹ 450',
      description:
        'In the arcade of Alcheringa, you win, you lose, but you always respawn. Keep playing, keep fighting, and like the Alcher Kid, chase the highest score relentlessly!',
      image: '/tshirt1.png',
    },
    {
      id: 2,
      name: 'Oversized T-Shirt',
      modelType: 'oversized',
      title: 'ARCADE',
      price: '₹ 600',
      description:
        'Our \'Arcade\' brings you the nostalgia of meeting friends after school, sharing laughs, and making memories. Meet me @ the arcade and relive those fun times together.',
      image: '/tshirt3.png',
    },
  ];
    const [current, setCurrent] = useState(1);
    const [currentm, setCurrentm] = useState(1);
    const [target, setTarget] = useState(new THREE.Vector3(0, 0, 0));
    const tshirts = ["/tshirt2.png", "/tshirt1.png", "/tshirt3.png"];
    const model = [
        { url: "/Hoodie.glb", scale: [19.6, 19.6, 19.6] },
        { url: "/Regular.glb", scale: [9, 9, 9] },
        { url: "/Oversized.glb", scale: [2.9, 2.9, 2.9] }
    ];
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(2);
    const [isVisible, setIsVisible] = useState(true);

    const handleExpandis = () => {setIsVisible(true);};

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
      const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
      useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
          window.addEventListener("resize", handleResize);
          return () => {
            window.removeEventListener("resize", handleResize);
          };
        };
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
              />
              <Image
                src="/cloudRight.png"
                className={`${styles.cloudRight} ${styles.cloud}`}
                width="1000"
                height="1000"
              />
              <Image
                src="/cloudRight.png"
                className={`${styles.cloudRight} ${styles.cloud}`}
                width="1000"
                height="1000"
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
              />
              <Image
                src="/cloudLeft.png"
                className={`${styles.cloudLeft} ${styles.cloud}`}
                width="1000"
                height="1000"
              />
              <Image
                src="/cloudLeft.png"
                className={`${styles.cloudLeft} ${styles.cloud}`}
                width="1000"
                height="1000"
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

            {/* {currentm == 0 && <Hoodie className={`${styles.moo} ${isVisible ? styles.del : styles.done}`} />}
                    {currentm == 1 && <Regular className={`${styles.moo} ${isVisible ? styles.del : styles.done}`} />}
                    {currentm == 2 && <Oversized className={`${styles.moo} ${isVisible ? styles.del : styles.done}`} />} */}

            {/* 
                    <Model url={model[current].url} setTarget={setTarget} scale={model[current].scale} /> */}
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
              "The Alcher Lady's mind exploded into the arcade world, her
              thoughts scattered across levels and blocks.
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
              respawn. Keep playing, keep fighting, and like the Alcher Kid,
              chase the highest score relentlessly!
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
              {/* Lorem ipsum, dolor sit amet consectetur<br /> adipisicing elit. Nesciunt aut, aperiam <br />unde sunt ullam ipsa doloribus incidunt!<br /> Magni veritatis cumque provident nam, <br />  voluptatibus minus quam, dolores repellendus<br /> expedita molestias at voluptas similique!</p> */}
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
              "The Alcher Lady's mind exploded into the arcade world, her
              thoughts scattered across levels and blocks.
              Wear the chaos, embrace the
              challenge. Game on with our exclusive mind-bending
              collection."
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
              respawn. Keep playing, keep fighting, and like the Alcher Kid,
              chase the highest score relentlessly!
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
              sharing laughs, and making memories. Meet me @ the arcade and
              relive those fun times together.
            </p>
          </div>
        }

        {current == 0 && (
          <button onClick={handleTryItNow} className={styles.btnMerchButton}>
            <Image
              src="/btnMerch.svg"
              className={styles.btnMerch}
              width="50"
              height="50"
              alt="Try it now"
            />
          </button>
        )}
        {current == 1 && (
          <button onClick={handleTryItNow} className={styles.btnMerchButton}>
            <Image
              src="/btnMerch.svg"
              className={styles.btnMerch}
              width="50"
              height="50"
              alt="Try it now"
            />
          </button>
        )}
        {current == 2 && (
          <button onClick={handleTryItNow} className={styles.btnMerchButton}>
            <Image
              src="/btnMerch.svg"
              className={styles.btnMerch}
              width="50"
              height="50"
              alt="Try it now"
            />
          </button>
        )}


        {
          <div
            className={`${styles.arrowRight} ${
              current == 0 ? styles.visibleright : styles.done
            }`}
          >
            <h3 style={{ fontFamily: "BrickPixel" }}>₹ 900</h3>
            {/* <p style={{ fontFamily: 'GameTape' }}>+$80 for delivery</p> */}
            <Image
              src="/dash.svg"
              className={styles.dash}
              width="30"
              height="30"
            />
          </div>
        }
        {
          <div
            className={`${styles.arrowRight} ${
              current === 1 ? styles.visibleright : styles.done
            }`}
          >
            <h3 style={{ fontFamily: "BrickPixel" }}>₹ 450 </h3>
            {/* <p style={{ fontFamily: 'GameTape' }}>+$81 for delivery</p> */}
            <Image
              src="/dash.svg"
              className={styles.dash}
              width="30"
              height="30"
            />
          </div>
        }
        {
          <div
            className={`${styles.arrowRight} ${
              current == 2 ? styles.visibleright : styles.done
            }`}
          >
            <h3 style={{ fontFamily: "BrickPixel" }}>₹ 600</h3>
            {/* <p style={{ fontFamily: 'GameTape' }}>+$82 for delivery</p> */}
            <Image
              src="/dash.svg"
              className={styles.dash}
              width="30"
              height="30"
            />
          </div>
        }

        {
          <div
            className={`${styles.mobileBottom} ${
              current == 0 ? styles.visibleright : styles.done
            }`}
          >
            <h3 style={{ fontFamily: "BrickPixel" }}>₹ 900</h3>
            {/* < style={{ fontFamily: 'GameTape' }}>+$80 for deliver */}
            {/* <Image src="/dash.svg" className={styles.dash} width="30" height="30" /> */}
          </div>
        }
        {
          <div
            className={`${styles.mobileBottom} ${
              current == 1 ? styles.visibleright : styles.done
            }`}
          >
            <h3 style={{ fontFamily: "BrickPixel" }}>₹ 450</h3>
            {/* <p style={{ fontFamily: 'GameTape' }}>+$81 for delivery</p> */}
            {/* <Image src="/dash.svg" className={styles.dash} width="30" height="30" /> */}
          </div>
        }
        {
          <div
            className={`${styles.mobileBottom} ${
              current == 2 ? styles.visibleright : styles.done
            }`}
          >
            <h3 style={{ fontFamily: "BrickPixel" }}>₹ 600</h3>
            {/* <p style={{ fontFamily: 'GameTape' }}>+$82 for delivery</p> */}
            {/* <Image src="/dash.svg" className={styles.dash} width="30" height="30" /> */}
          </div>
        }

        {current == 0 && (
          <button onClick={handleTryItNow} className={styles.mobileBtnButton}>
            <Image
              src="/mobile-btn.svg"
              className={styles.mobileBtn}
              width="50"
              height="50"
              alt="Try it now"
            />
          </button>
        )}
        {current == 1 && (
          <button onClick={handleTryItNow} className={styles.mobileBtnButton}>
            <Image
              src="/mobile-btn.svg"
              className={styles.mobileBtn}
              width="50"
              height="50"
              alt="Try it now"
            />
          </button>
        )}
        {current == 2 && (
          <button onClick={handleTryItNow} className={styles.mobileBtnButton}>
            <Image
              src="/mobile-btn.svg"
              className={styles.mobileBtn}
              width="50"
              height="50"
              alt="Try it now"
            />
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
            />
          </button>
          <Image
            src={tshirts[left]}
            className={styles.leftTshirt}
            width="130"
            height="130"
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
            <Image src="/button3.svg" width="150" height="150" />
          </div>
          <div
            className={
              currentm == 1
                ? `${styles.activeBtn} ${styles.merch3d} ${styles.bot}`
                : `${styles.merch3d} ${styles.bot}`
            }
            onClick={handleBtn2}
          >
            <Image src="/button1.svg" width="150" height="150" />
          </div>
          <div
            className={
              currentm == 2
                ? `${styles.activeBtn} ${styles.merch3d} ${styles.bot}`
                : `${styles.merch3d} ${styles.bot}`
            }
            onClick={handleBtn3}
          >
            <Image src="/button2.svg" width="150" height="150" />
          </div>
        </div>
        <div className={styles.rightBtns}>
          <Image
            src={tshirts[right]}
            className={styles.rightTshirt}
            width="130"
            height="130"
          />
          <button>
            <Image
              src="/rightBtn.svg"
              className={styles.rightMerchbtn}
              width="70"
              height="70"
              onClick={handleRight}
            />
          </button>
        </div>
      </div>
    );
}