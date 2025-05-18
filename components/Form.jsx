import { useState, useRef, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from './Form.module.css'
import { hasThirdPartyConsent } from '../src/utils/consentUtils'
import RecaptchaStyling from './RecaptchaStyling'

const Form = () => {
  const [formFields, setFormFields] = useState({
    name: '',
    surname: '',
    email: '',
    message: '',
    terms: 'no',
  })

  const [status, setStatus] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [consentRequired, setConsentRequired] = useState(false)
  const recaptchaRef = useRef()

  // Check consent status on component mount
  useEffect(() => {
    // Initial consent check
    const hasConsent = hasThirdPartyConsent()
    setConsentRequired(!hasConsent)

    // Listen for consent changes
    const handleConsentChange = (event) => {
      if (event.detail && event.detail.consent === 'all') {
        // Update UI immediately when consent is granted
        setConsentRequired(false)

        // Manually load reCAPTCHA if needed
        import('../src/utils/consentUtils').then((module) => {
          module.loadReCaptcha()

          // Force a small delay to make sure reCAPTCHA is properly initialized
          setTimeout(() => {
            // Clear any previous status message related to consent
            if (status.includes('cookie') || status.includes('consent')) {
              setStatus('')
            }
          }, 1000)
        })
      } else if (event.detail && event.detail.consent === 'essential') {
        // Update UI immediately when consent is declined
        setConsentRequired(true)

        // Set a status message if form was previously in a submittable state
        if (
          !status.includes('cookie') &&
          !status.includes('consent') &&
          formFields.terms === 'yes'
        ) {
          setStatus('reCAPTCHA requires cookie consent to submit this form.')
        }
      }
    }

    window.addEventListener('consentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('consentChanged', handleConsentChange)
    }
  }, [status, formFields.terms])

  const fullWidthStyles = [styles.inputWrapper, styles.fullWidth].join(' ')

  const getApiUrl = () => {
    if (import.meta.env.VITE_NODE_ENV === 'production') {
      return `${import.meta.env.VITE_API_BASE_URL_PROD}/api/feedback`
    }
    return `${import.meta.env.VITE_API_BASE_URL_LOCAL}/api/feedback`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // If reCAPTCHA consent is required but not given, show message
    if (consentRequired) {
      setStatus(
        "To submit this form, you must accept cookies for reCAPTCHA by clicking 'Accept All' in the cookie banner. You can find it in the page footer."
      )
      return
    }

    try {
      // Execute reCAPTCHA verification
      if (!recaptchaRef.current) {
        setStatus('ReCAPTCHA could not be loaded. Please try again later.')
        return
      }

      const captchaToken = await recaptchaRef.current.executeAsync()
      recaptchaRef.current.reset()

      const data = { ...formFields, captchaToken }

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setFormFields({
          name: '',
          surname: '',
          email: '',
          message: '',
          terms: 'no',
        })
        setOpenModal(true)
        setStatus('Message sent successfully!')
      } else {
        try {
          const errorData = await response.json()
          setStatus(
            errorData.message || 'There was an error sending the message.'
          )
        } catch (jsonError) {
          setStatus('An unknown error occurred. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setStatus('Network error. Please try again later.')
    }
  }

  const handleOnChange = (event) => {
    setFormFields((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }))
  }

  const isFormValid =
    formFields.name &&
    formFields.surname &&
    formFields.email &&
    formFields.message &&
    formFields.terms === 'yes'

  return (
    <>
      <div className={styles.wrapper}>
        <h1 className={styles.header}>Contact Us:</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputWrapperRow}>
            <div className={styles.inputItem}>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formFields.name}
                onChange={handleOnChange}
                required
              />
            </div>
            <div className={styles.inputItem}>
              <label htmlFor="surname">Surname:</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formFields.surname}
                onChange={handleOnChange}
                required
              />
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formFields.email}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className={fullWidthStyles}>
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formFields.message}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className={fullWidthStyles}>
            <legend style={{ color: 'grey', fontWeight: '200' }}>
              Do you agree to the terms?
            </legend>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="terms"
                  value="yes"
                  checked={formFields.terms === 'yes'}
                  onChange={handleOnChange}
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="terms"
                  value="no"
                  checked={formFields.terms === 'no'}
                  onChange={handleOnChange}
                />{' '}
                No
              </label>
            </div>
          </div>
          <div>
            {consentRequired && (
              <div className={styles.consentMessage}>
                <h3>Cookie Consent Required for Form Submission</h3>
                <p>
                  To submit this form, you need to accept cookies. Google
                  reCAPTCHA requires cookies to protect our website from spam
                  and abuse.
                </p>
                <p>
                  Please accept cookies by clicking &quot;Accept All&quot; in
                  the
                  <button
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('openCookieSettings')
                      )
                    }
                    className={styles.cookieSettingsLink}
                  >
                    cookie settings
                  </button>
                  .
                </p>
              </div>
            )}

            <button
              className={styles.button}
              type="submit"
              disabled={!isFormValid || consentRequired}
            >
              Submit
            </button>

            {status && <div className={styles.statusMessage}>{status}</div>}

            <div className={styles.textArea}>
              <p style={{ fontStyle: 'italic', fontFamily: 'monospace' }}>
                We will respond to every email within 24 hours, from Monday to
                Saturday.
              </p>

              <p style={{ fontStyle: 'italic', fontFamily: 'monospace' }}>
                You can also call us at our toll-free number:{' '}
                <a
                  href="tel:+4917620652851"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  017620652851
                </a>{' '}
                - from 9AM to 9PM EST Monday to Friday, and 10AM to 9PM EST on
                Saturday.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Only render ReCAPTCHA if the user has given consent */}
      {!consentRequired && (
        <>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            size="invisible"
            ref={recaptchaRef}
          />
              <RecaptchaStyling />
          </>
      )}
    </>
  )
}

export default Form
